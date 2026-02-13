import React, { useState, useEffect } from 'react';
import { ServerRail } from './ServerRail';
import { ChannelSidebar } from './ChannelSidebar';
import { ChatArea } from './ChatArea';
import { MemberSidebar } from './MemberSidebar';
import { MobileNav } from './MobileNav';
import { ServerGrid } from './ServerGrid';
import { SettingsPanel } from '../settings/SettingsPanel';
import { CreateServerModal } from '../modals/CreateServerModal';
import { SERVERS, USERS, MESSAGES } from '../../data/mock';

type MobileView = 'home' | 'server-grid' | 'channel-list' | 'chat' | 'profile' | 'search';

export const AppLayout: React.FC = () => {
  // State
  const [selectedServerId, setSelectedServerId] = useState<string>(SERVERS[0].id);
  const [selectedChannelId, setSelectedChannelId] = useState<string>(SERVERS[0].categories[0].channels[0].id);
  
  // UI State
  const [isMemberSidebarOpen, setMemberSidebarOpen] = useState(true); // Desktop right panel
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateServer, setShowCreateServer] = useState(false);
  
  // Mobile Specific State
  const [mobileTab, setMobileTab] = useState<'home' | 'servers' | 'search' | 'profile'>('servers');
  const [mobileView, setMobileView] = useState<MobileView>('chat'); 

  // Derived Data
  const selectedServer = SERVERS.find(s => s.id === selectedServerId) || SERVERS[0];
  const selectedChannel = selectedServer.categories
    .flatMap(c => c.channels)
    .find(ch => ch.id === selectedChannelId) || selectedServer.categories[0].channels[0];

  // Initialize view based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // Reset mobile specific states if moving to desktop
        setMobileView('chat'); 
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handlers
  const handleMobileTabSelect = (tab: 'home' | 'servers' | 'search' | 'profile') => {
    setMobileTab(tab);
    if (tab === 'servers') {
      // If tapping servers, go to grid if we aren't already in a deep view, or maybe always go to grid?
      // For this UX, let's say tapping 'Servers' goes to the Server Grid
      setMobileView('server-grid');
    } else {
      setMobileView(tab as MobileView);
    }
  };

  const handleServerSelect = (id: string) => {
    setSelectedServerId(id);
    const server = SERVERS.find(s => s.id === id);
    if (server?.categories[0]?.channels[0]) {
      setSelectedChannelId(server.categories[0].channels[0].id);
    }
    
    // On mobile, moving from Grid -> Channel List
    if (window.innerWidth < 768) {
      setMobileView('channel-list');
    }
  };

  const handleChannelSelect = (id: string) => {
    setSelectedChannelId(id);
    // On mobile, moving from Channel List -> Chat
    if (window.innerWidth < 768) {
      setMobileView('chat');
    }
  };

  const handleCreateServer = (name: string) => {
    console.log('Creating server:', name);
    // Logic to add server would go here
  };

  // Helper to determine what to render on mobile
  const renderMobileContent = () => {
    switch (mobileView) {
      case 'server-grid':
        return (
          <ServerGrid 
             onServerSelect={handleServerSelect} 
             onAddServer={() => setShowCreateServer(true)}
          />
        );
      case 'channel-list':
        return (
          <div className="h-full bg-surface-container">
             {/* Back Button for mobile navigation */}
             <div className="h-12 flex items-center px-4 border-b border-outline-variant/20">
               <button onClick={() => setMobileView('server-grid')} className="mr-4">
                 <span className="material-symbols-outlined">arrow_back</span>
               </button>
               <span className="font-bold">Select Channel</span>
             </div>
             <ChannelSidebar 
                server={selectedServer}
                selectedChannelId={selectedChannelId}
                onChannelSelect={handleChannelSelect}
                mobileOpen={true} // Always "open" in this view
                onOpenSettings={() => setShowSettings(true)}
             />
          </div>
        );
      case 'chat':
        return (
          <div className="flex flex-col h-full">
            {/* Mobile Chat Header with Back Button to Channel List */}
            <div className="h-14 bg-surface-container flex items-center justify-between px-4 border-b border-outline-variant/20 flex-shrink-0">
               <div className="flex items-center overflow-hidden">
                 <button onClick={() => setMobileView('channel-list')} className="mr-2 -ml-2 p-2">
                   <span className="material-symbols-outlined">arrow_back</span>
                 </button>
                 <span className="font-bold text-title-medium truncate">#{selectedChannel.name}</span>
               </div>
               <button onClick={() => setMemberSidebarOpen(true)} className="p-2 -mr-2">
                 <span className="material-symbols-outlined">group</span>
               </button>
            </div>
            
            <div className="flex-1 overflow-hidden relative">
              <ChatArea 
                channel={selectedChannel}
                messages={MESSAGES}
                onSendMessage={(msg) => console.log(msg)}
                onToggleMemberList={() => setMemberSidebarOpen(true)}
                isMemberListOpen={false} // Managed by overlay on mobile
              />
            </div>
          </div>
        );
      case 'home':
        return <div className="p-8 text-center text-on-surface-variant">Home / DMs Placeholder</div>;
      case 'search':
        return <div className="p-8 text-center text-on-surface-variant">Global Search Placeholder</div>;
      case 'profile':
        return (
          <div className="p-8 text-center text-on-surface-variant">
             <button onClick={() => setShowSettings(true)} className="bg-surface-container-high px-4 py-2 rounded-full">Open Settings</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-background text-on-surface overflow-hidden">
      
      {/* --- DESKTOP LAYOUT --- */}
      <div className="hidden md:flex flex-row w-full h-full">
        {/* 1. Server Rail */}
        <ServerRail 
          selectedServerId={selectedServerId}
          onServerSelect={handleServerSelect}
          onHomeSelect={() => console.log('Home')}
          isHomeSelected={false}
          onAddServer={() => setShowCreateServer(true)}
        />

        {/* 2. Channel Sidebar */}
        <div className="w-60 bg-surface-container border-r border-outline-variant/20 flex-shrink-0">
           <ChannelSidebar 
             server={selectedServer}
             selectedChannelId={selectedChannelId}
             onChannelSelect={handleChannelSelect}
             mobileOpen={false}
             onOpenSettings={() => setShowSettings(true)}
           />
        </div>

        {/* 3. Main Chat */}
        <ChatArea 
          channel={selectedChannel}
          messages={MESSAGES}
          onSendMessage={(msg) => console.log(msg)}
          onToggleMemberList={() => setMemberSidebarOpen(!isMemberSidebarOpen)}
          isMemberListOpen={isMemberSidebarOpen}
        />

        {/* 4. Member Sidebar */}
        {isMemberSidebarOpen && (
          <MemberSidebar 
            users={USERS}
            isOpen={true}
          />
        )}
      </div>

      {/* --- MOBILE LAYOUT --- */}
      <div className="md:hidden flex flex-col w-full h-full relative">
        <div className="flex-1 overflow-hidden">
          {renderMobileContent()}
        </div>

        {/* Mobile Member Sidebar Overlay */}
        {isMemberSidebarOpen && mobileView === 'chat' && (
           <div className="fixed inset-0 z-50">
             <MemberSidebar 
               users={USERS}
               isOpen={isMemberSidebarOpen}
               onCloseMobile={() => setMemberSidebarOpen(false)}
             />
           </div>
        )}

        {/* Bottom Nav */}
        <MobileNav 
          activeTab={mobileTab}
          onTabSelect={handleMobileTabSelect}
        />
        {/* Spacer for bottom nav safe area */}
        <div className="h-16 flex-shrink-0" /> 
      </div>

      {/* --- MODALS --- */}
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      
      {showCreateServer && (
        <CreateServerModal 
           onClose={() => setShowCreateServer(false)} 
           onCreate={handleCreateServer} 
        />
      )}

    </div>
  );
};