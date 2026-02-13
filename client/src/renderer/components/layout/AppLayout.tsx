import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ServerRail } from './ServerRail';
import { ChannelSidebar } from './ChannelSidebar';
import { ChatArea } from './ChatArea';
import { MemberSidebar } from './MemberSidebar';
import { MobileNav } from './MobileNav';
import { ServerGrid } from './ServerGrid';
import { SettingsPanel } from '../settings/SettingsPanel';
import { CreateServerModal } from '../modals/CreateServerModal';
import { SERVERS, USERS, MESSAGES, DM_CONVERSATIONS, CURRENT_USER } from '../../data/mock';
import type { Server, Channel } from '../../data/mock';

type MobileView = 'home' | 'server-grid' | 'channel-list' | 'chat' | 'profile' | 'search';
type MobileTab = 'home' | 'servers' | 'search' | 'profile' | 'settings';

interface Snackbar {
  id: string;
  message: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

const SWIPE_THRESHOLD = 60;
const SWIPE_VELOCITY_THRESHOLD = 0.3;

export const AppLayout: React.FC = () => {
  const [selectedServerId, setSelectedServerId] = useState<string>(SERVERS[0].id);
  const [selectedChannelId, setSelectedChannelId] = useState<string>(SERVERS[0].categories[0].channels[0].id);
  const [isHomeSelected, setIsHomeSelected] = useState(false);
  const [isMemberSidebarOpen, setMemberSidebarOpen] = useState(true);
  const [isMobileChannelDrawerOpen, setMobileChannelDrawerOpen] = useState(false);
  const [isMobileMemberDrawerOpen, setMobileMemberDrawerOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showQuickSwitcher, setShowQuickSwitcher] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('servers');
  const [mobileView, setMobileView] = useState<MobileView>('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickSwitcherQuery, setQuickSwitcherQuery] = useState('');
  const [snackbars, setSnackbars] = useState<Snackbar[]>([]);

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const selectedServer: Server = SERVERS.find((s) => s.id === selectedServerId) || SERVERS[0];
  const selectedChannel: Channel = selectedServer.categories.flatMap((c) => c.channels).find((ch) => ch.id === selectedChannelId) || selectedServer.categories[0].channels[0];

  const quickSwitcherResults = React.useMemo(() => {
    if (!quickSwitcherQuery.trim()) return [];
    const q = quickSwitcherQuery.toLowerCase();
    const results: any[] = [];
    for (const server of SERVERS) {
      if (server.name.toLowerCase().includes(q)) results.push({ type: 'server', id: server.id, name: server.name, serverId: server.id, serverName: server.name });
      for (const cat of server.categories) {
        for (const ch of cat.channels) {
          if (ch.name.toLowerCase().includes(q)) results.push({ type: 'channel', id: ch.id, name: ch.name, serverId: server.id, serverName: server.name });
        }
      }
    }
    return results.slice(0, 12);
  }, [quickSwitcherQuery]);

  const onlineFriends = USERS.filter((u) => u.id !== 'me' && u.status !== 'offline');

  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return { servers: [], channels: [] };
    const q = searchQuery.toLowerCase();
    const servers = SERVERS.filter((s) => s.name.toLowerCase().includes(q));
    const channels: Channel[] = [];
    for (const server of SERVERS) {
      for (const cat of server.categories) {
        for (const ch of cat.channels) {
          if (ch.name.toLowerCase().includes(q)) channels.push(ch);
        }
      }
    }
    return { servers, channels: channels.slice(0, 10) };
  }, [searchQuery]);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) { setMobileView('chat'); setMobileChannelDrawerOpen(false); setMobileMemberDrawerOpen(false); } };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowQuickSwitcher(prev => !prev); setQuickSwitcherQuery(''); }
      if (e.key === 'Escape') { setShowQuickSwitcher(false); setShowCreateServer(false); setShowSettings(false); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (snackbars.length === 0) return;
    const timers = snackbars.map((snack) => setTimeout(() => setSnackbars(prev => prev.filter(s => s.id !== snack.id)), snack.duration || 4000));
    return () => timers.forEach(clearTimeout);
  }, [snackbars]);

  const showSnackbar = useCallback((message: string, action?: { label: string; onClick: () => void }, duration?: number) => {
    const id = `snack-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setSnackbars(prev => [...prev.slice(-4), { id, message, action, duration }]);
  }, []);

  const dismissSnackbar = useCallback((id: string) => setSnackbars(prev => prev.filter(s => s.id !== id)), []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const elapsed = Date.now() - touchStartRef.current.time;
    if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (Math.abs(deltaX) > SWIPE_THRESHOLD || (Math.abs(deltaX) / elapsed) > SWIPE_VELOCITY_THRESHOLD) {
        if (deltaX > 0) setMobileChannelDrawerOpen(true);
        else setMobileMemberDrawerOpen(true);
      }
    }
    touchStartRef.current = null;
  }, []);

  const handleMobileTabSelect = useCallback((tab: MobileTab) => {
    setMobileTab(tab);
    if (tab === 'home') { setMobileView('home'); setIsHomeSelected(true); }
    else if (tab === 'servers') { setMobileView('server-grid'); setIsHomeSelected(false); }
    else if (tab === 'search') { setMobileView('search'); setSearchQuery(''); }
    else if (tab === 'profile') setMobileView('profile');
    else if (tab === 'settings') setShowSettings(true);
  }, []);

  const handleHomeSelect = useCallback(() => {
    setIsHomeSelected(true);
    if (window.innerWidth < 768) { setMobileView('home'); setMobileTab('home'); }
  }, []);

  const handleServerSelect = useCallback((id: string) => {
    setSelectedServerId(id); setIsHomeSelected(false);
    const server = SERVERS.find(s => s.id === id);
    if (server?.categories[0]?.channels[0]) setSelectedChannelId(server.categories[0].channels[0].id);
    if (window.innerWidth < 768) setMobileView('channel-list');
  }, []);

  const handleChannelSelect = useCallback((id: string) => {
    setSelectedChannelId(id);
    if (window.innerWidth < 768) setMobileView('chat');
  }, []);

  const handleSendMessage = useCallback(() => { showSnackbar(`Message sent to #${selectedChannel.name}`); }, [selectedChannel.name, showSnackbar]);
  const handleCreateServer = useCallback((name: string) => { showSnackbar(`Server "${name}" created!`); }, [showSnackbar]);
  const handleQuickSwitcherSelect = useCallback((result: any) => {
    if (result.type === 'server') handleServerSelect(result.id);
    else { setSelectedServerId(result.serverId); handleChannelSelect(result.id); setIsHomeSelected(false); }
    setShowQuickSwitcher(false); setQuickSwitcherQuery('');
  }, [handleServerSelect, handleChannelSelect]);

  const renderHomeView = (isMobile: boolean = false) => (
    <div className={`flex flex-col h-full bg-surface ${isMobile ? '' : 'flex-1'}`}>
      <div className="p-4 sm:p-6 shrink-0 bg-surface">
        <div className="m3-search-bar w-full max-w-3xl mx-auto">
          <span className="material-symbols-outlined text-on-surface-variant">search</span>
          <input type="text" placeholder="Search..." className="flex-1 bg-transparent border-none outline-none text-body-large text-on-surface" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-24 sm:pb-6">
        <div className="max-w-5xl mx-auto space-y-8 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[{ label: 'Online', value: onlineFriends.length, icon: 'person', color: 'text-primary' }, { label: 'Pending', value: 0, icon: 'person_add', color: 'text-secondary' }, { label: 'Blocked', value: 0, icon: 'block', color: 'text-error' }].map((stat, i) => (
              <div key={i} className="m3-card !p-4 flex items-center gap-4 border border-outline-variant/10">
                <div className={`w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center ${stat.color}`}><span className="material-symbols-outlined">{stat.icon}</span></div>
                <div><p className="text-label-medium text-on-surface-variant">{stat.label}</p><p className="text-title-large font-bold text-on-surface">{stat.value}</p></div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <h3 className="text-label-large font-bold text-primary uppercase tracking-widest">Recent Chats</h3>
            <div className="m3-card !p-2 border border-outline-variant/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {DM_CONVERSATIONS.map((dm) => (
                  <button key={dm.id} className="m3-navigation-drawer-item !mx-0 hover:bg-on-surface/[0.04]" onClick={() => showSnackbar(`Opening DM with ${dm.user.username}`)}>
                    <div className="relative">
                      <img src={dm.user.avatar} alt="" className="w-10 h-10 rounded-full" />
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface-container ${dm.user.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-label-large font-bold text-on-surface truncate">{dm.user.username}</p>
                      <p className="text-body-small text-on-surface-variant truncate">{dm.lastMessage}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMobileSearchView = () => (
    <div className="flex flex-col h-full bg-surface animate-fade-in">
      <div className="p-4 bg-surface shrink-0">
        <div className="m3-search-bar w-full !bg-surface-container-high !shadow-none">
          <span className="material-symbols-outlined text-primary">search</span>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="flex-1 bg-transparent outline-none text-on-surface text-body-large" autoFocus />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {searchQuery.trim() && (
          <div className="space-y-6 py-2">
            {searchResults.servers.length > 0 && (
              <div>
                <h4 className="text-label-small font-bold text-primary uppercase tracking-widest mb-3 px-2">Servers</h4>
                <div className="m3-card !p-1 border border-outline-variant/5">
                  {searchResults.servers.map((s: any) => (
                    <button key={s.id} onClick={() => handleServerSelect(s.id)} className="w-full flex items-center h-16 px-3 rounded-[20px] hover:bg-on-surface/[0.04]">
                      <img src={s.icon} alt="" className="w-11 h-11 rounded-[12px]" />
                      <div className="ml-4 text-left flex-1 min-w-0"><span className="text-label-large font-bold text-on-surface block truncate">{s.name}</span></div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderMobileProfileView = () => (
    <div className="flex flex-col h-full bg-surface animate-fade-in overflow-y-auto pb-24">
      <div className="h-16 px-6 flex items-center justify-between shrink-0"><h2 className="text-title-large font-bold text-on-surface">You</h2><button onClick={() => setShowSettings(true)} className="m3-icon-button"><span className="material-symbols-outlined">settings</span></button></div>
      <div className="px-6 space-y-6">
        <div className="flex items-center gap-5 pt-2">
          <div className="relative"><img src={CURRENT_USER.avatar} alt="" className="w-24 h-24 rounded-full border-4 border-surface" /><div className="absolute bottom-1.5 right-1.5 w-6 h-6 bg-green-500 rounded-full border-4 border-surface" /></div>
          <div className="flex-1 min-w-0"><h2 className="text-headline-small font-bold text-on-surface truncate">{CURRENT_USER.username}</h2><p className="text-body-medium text-on-surface-variant opacity-70">#{CURRENT_USER.discriminator}</p></div>
        </div>
        <div className="m3-card !p-2 border border-outline-variant/5">
          {[{ icon: 'mood', label: 'Set Status' }, { icon: 'switch_account', label: 'Switch Account' }].map((item, i) => (
            <button key={i} className="w-full flex items-center h-14 px-4 rounded-[16px] hover:bg-on-surface/[0.04] transition-all text-left">
              <span className="material-symbols-outlined text-on-surface-variant mr-4">{item.icon}</span><span className="text-body-large text-on-surface flex-1">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMobileContent = () => {
    switch (mobileView) {
      case 'server-grid': return <div className="h-full animate-fade-in"><ServerGrid onServerSelect={handleServerSelect} onAddServer={() => setShowCreateServer(true)} /></div>;
      case 'channel-list': return (
        <div className="h-full bg-surface-container-low animate-slide-up flex flex-col">
          <div className="h-16 px-4 flex items-center border-b border-outline-variant/10 flex-shrink-0 bg-surface">
            <button onClick={() => setMobileView('server-grid')} className="m3-icon-button -ml-2 mr-2"><span className="material-symbols-outlined">arrow_back</span></button>
            <div className="flex items-center overflow-hidden"><img src={selectedServer.icon} alt="" className="w-8 h-8 rounded-full mr-3" /><span className="text-title-medium font-bold text-on-surface truncate">{selectedServer.name}</span></div>
          </div>
          <div className="flex-1 overflow-hidden"><ChannelSidebar server={selectedServer} selectedChannelId={selectedChannelId} onChannelSelect={handleChannelSelect} mobileOpen={true} onOpenSettings={() => setShowSettings(true)} /></div>
        </div>
      );
      case 'chat': return (
        <div className="flex flex-col h-full bg-surface" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div className="h-16 px-4 flex items-center justify-between border-b border-outline-variant/10 bg-surface shrink-0 z-10">
            <div className="flex items-center min-w-0">
              <button onClick={() => setMobileView('channel-list')} className="m3-icon-button -ml-2 mr-1"><span className="material-symbols-outlined">arrow_back</span></button>
              <div className="flex flex-col min-w-0"><span className="text-title-medium font-bold text-on-surface truncate leading-tight">#{selectedChannel.name}</span><span className="text-[10px] text-on-surface-variant font-medium truncate opacity-70 leading-tight">{selectedServer.name}</span></div>
            </div>
            <div className="flex items-center gap-1 shrink-0"><button onClick={() => setShowQuickSwitcher(true)} className="m3-icon-button"><span className="material-symbols-outlined text-[22px]">search</span></button><button onClick={() => setMobileMemberDrawerOpen(true)} className="m3-icon-button"><span className="material-symbols-outlined text-[22px]">group</span></button></div>
          </div>
          <div className="flex-1 overflow-hidden relative"><ChatArea channel={selectedChannel} messages={MESSAGES} onSendMessage={handleSendMessage} onToggleMemberList={() => setMobileMemberDrawerOpen(true)} isMemberListOpen={false} /></div>
        </div>
      );
      case 'home': return renderHomeView(true);
      case 'search': return renderMobileSearchView();
      case 'profile': return renderMobileProfileView();
      default: return null;
    }
  };

  const renderQuickSwitcher = () => {
    if (!showQuickSwitcher) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4 animate-fade-in">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowQuickSwitcher(false); setQuickSwitcherQuery(''); }} />
        <div className="relative w-full max-w-lg bg-surface rounded-[28px] shadow-elevation-5 overflow-hidden animate-scale-in border border-outline-variant/10">
          <div className="p-6 pb-4">
            <div className="m3-search-bar !h-14 !bg-surface-container-high !shadow-none ring-1 ring-outline-variant/20 focus-within:ring-2 focus-within:ring-primary">
              <span className="material-symbols-outlined text-primary text-[24px]">explore</span>
              <input type="text" value={quickSwitcherQuery} onChange={(e) => setQuickSwitcherQuery(e.target.value)} placeholder="Where to?" className="flex-1 bg-transparent outline-none text-on-surface text-body-large" autoFocus />
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto py-2 thin-scrollbar px-3 space-y-1">
            {quickSwitcherResults.map((res) => (
              <button key={`${res.type}-${res.id}`} className="w-full m3-navigation-drawer-item group !mx-0 hover:bg-primary/[0.08]" onClick={() => handleQuickSwitcherSelect(res)}>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">{res.type === 'server' ? 'dns' : 'tag'}</span>
                <div className="flex-1 min-w-0 text-left"><div className="text-label-large font-bold text-on-surface truncate">{res.name}</div><div className="text-[10px] text-on-surface-variant uppercase opacity-70">{res.type === 'channel' ? `in ${res.serverName}` : 'Server'}</div></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSnackbars = () => (
    <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[150] flex flex-col items-center space-y-2 w-full max-w-sm px-4 pointer-events-none">
      {snackbars.map((snack) => (
        <div key={snack.id} className="w-full bg-surface-container-highest text-on-surface-variant px-4 py-3 rounded-xl shadow-elevation-3 flex items-center justify-between pointer-events-auto animate-toast-enter border border-outline-variant/10">
          <span className="text-body-medium flex-1 mr-4">{snack.message}</span>
          <div className="flex items-center gap-2 flex-shrink-0">
            {snack.action && <button onClick={() => { snack.action!.onClick(); dismissSnackbar(snack.id); }} className="m3-button-text !h-8 !px-3 !text-primary !text-[11px] font-black uppercase">{snack.action.label}</button>}
            <button onClick={() => dismissSnackbar(snack.id)} className="m3-icon-button !w-8 !h-8"><span className="material-symbols-outlined text-[18px]">close</span></button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden font-sans selection:bg-primary/30 text-on-background">
      <div className="hidden md:flex w-full h-full relative overflow-hidden">
        <ServerRail selectedServerId={selectedServerId} onServerSelect={handleServerSelect} onHomeSelect={handleHomeSelect} isHomeSelected={isHomeSelected} onAddServer={() => setShowCreateServer(true)} />
        {!isHomeSelected && (
          <div className="w-72 bg-surface-container-low border-r border-outline-variant/10 flex-shrink-0 flex flex-col rounded-r-[28px] shadow-elevation-1 my-0 z-10">
            <ChannelSidebar server={selectedServer} selectedChannelId={selectedChannelId} onChannelSelect={handleChannelSelect} mobileOpen={false} onOpenSettings={() => setShowSettings(true)} />
          </div>
        )}
        {isHomeSelected && (
          <div className="w-72 bg-surface-container-low border-r border-outline-variant/10 flex-shrink-0 flex flex-col rounded-r-[28px] shadow-elevation-1 my-0 z-10">
            <div className="h-16 px-6 flex items-center shrink-0"><h1 className="text-title-medium font-bold text-on-surface">Direct Messages</h1></div>
            <div className="flex-1 overflow-y-auto py-2 thin-scrollbar">
              <div className="px-3 mb-4"><button className="w-full flex items-center h-14 px-4 rounded-full bg-secondary-container text-on-secondary-container shadow-sm" onClick={() => setShowQuickSwitcher(true)}><span className="material-symbols-outlined text-[24px] mr-3">search</span><span className="text-label-large font-medium">Find conversation</span></button></div>
              <div className="space-y-1">
                {DM_CONVERSATIONS.map((dm) => (
                  <div key={dm.id} className="px-3"><button className="w-full flex items-center h-14 px-4 rounded-full hover:bg-on-surface/[0.08]" onClick={() => showSnackbar(`Opening DM with ${dm.user.username}`)}><img src={dm.user.avatar} alt="" className="w-10 h-10 rounded-full mr-3" /><div className="flex-1 min-w-0 text-left"><span className="text-label-large font-bold text-on-surface truncate block">{dm.user.username}</span><span className="text-body-small text-on-surface-variant truncate block opacity-70">{dm.lastMessage}</span></div></button></div>
                ))}
              </div>
            </div>
            <div className="bg-surface-container-high mx-3 mb-3 p-2 rounded-[20px] flex items-center justify-between flex-shrink-0 shadow-elevation-1">
              <div className="flex items-center p-1 rounded-full hover:bg-on-surface/[0.08] cursor-pointer group mr-auto max-w-[65%]"><img src={CURRENT_USER.avatar} alt="" className="w-9 h-9 rounded-full mr-2.5" /><div className="overflow-hidden"><div className="text-label-medium font-bold truncate text-on-surface">{CURRENT_USER.username}</div><div className="text-[10px] text-on-surface-variant truncate">Online</div></div></div>
              <button onClick={() => setShowSettings(true)} className="w-10 h-10 rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-[22px]">settings</span></button>
            </div>
          </div>
        )}
        <div className="flex-1 flex flex-col bg-surface overflow-hidden">{isHomeSelected ? renderHomeView(false) : <ChatArea channel={selectedChannel} messages={MESSAGES} onSendMessage={handleSendMessage} onToggleMemberList={() => setMemberSidebarOpen(!isMemberSidebarOpen)} isMemberListOpen={isMemberSidebarOpen} />}</div>
        {isMemberSidebarOpen && !isHomeSelected && <MemberSidebar users={USERS} isOpen={true} />}
      </div>
      <div className="md:hidden flex flex-col w-full h-full relative bg-surface overflow-hidden"><div className="flex-1 overflow-hidden">{renderMobileContent()}</div><MobileNav activeTab={mobileTab} onTabSelect={handleMobileTabSelect} /></div>
      <ChannelSidebar server={selectedServer} selectedChannelId={selectedChannelId} onChannelSelect={handleChannelSelect} mobileOpen={isMobileChannelDrawerOpen} onCloseMobile={() => setMobileChannelDrawerOpen(false)} onOpenSettings={() => setShowSettings(true)} />
      <MemberSidebar users={USERS} isOpen={isMobileMemberDrawerOpen} onCloseMobile={() => setMobileMemberDrawerOpen(false)} />
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      {showCreateServer && <CreateServerModal onClose={() => setShowCreateServer(false)} onCreate={handleCreateServer} />}
      {renderQuickSwitcher()}
      {renderSnackbars()}
    </div>
  );
};