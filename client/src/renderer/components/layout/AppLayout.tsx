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

// ─── Type Definitions ──────────────────────────────────────────────────────────

type MobileView = 'home' | 'server-grid' | 'channel-list' | 'chat' | 'profile' | 'search';
type MobileTab = 'home' | 'servers' | 'search' | 'profile' | 'settings';
type FriendsTab = 'online' | 'all' | 'pending' | 'blocked';

interface Snackbar {
  id: string;
  message: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const SWIPE_THRESHOLD = 60;
const SWIPE_VELOCITY_THRESHOLD = 0.3;

// ─── Component ─────────────────────────────────────────────────────────────────

export const AppLayout: React.FC = () => {
  // ── Core Selection State ───────────────────────────────────────────────────

  const [selectedServerId, setSelectedServerId] = useState<string>(SERVERS[0].id);
  const [selectedChannelId, setSelectedChannelId] = useState<string>(
    SERVERS[0].categories[0].channels[0].id
  );
  const [isHomeSelected, setIsHomeSelected] = useState(false);

  // ── UI Panel State ─────────────────────────────────────────────────────────

  const [isMemberSidebarOpen, setMemberSidebarOpen] = useState(true);
  const [isMobileChannelDrawerOpen, setMobileChannelDrawerOpen] = useState(false);
  const [isMobileMemberDrawerOpen, setMobileMemberDrawerOpen] = useState(false);

  // ── Modal State ────────────────────────────────────────────────────────────

  const [showSettings, setShowSettings] = useState(false);
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showQuickSwitcher, setShowQuickSwitcher] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // ── Mobile Navigation State ────────────────────────────────────────────────

  const [mobileTab, setMobileTab] = useState<MobileTab>('servers');
  const [mobileView, setMobileView] = useState<MobileView>('chat');

  // ── Home View State ────────────────────────────────────────────────────────

  const [friendsTab, setFriendsTab] = useState<FriendsTab>('online');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickSwitcherQuery, setQuickSwitcherQuery] = useState('');

  // ── Snackbar State ─────────────────────────────────────────────────────────

  const [snackbars, setSnackbars] = useState<Snackbar[]>([]);

  // ── Swipe Gesture State ────────────────────────────────────────────────────

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  // ── Derived Data ───────────────────────────────────────────────────────────

  const selectedServer: Server =
    SERVERS.find((s) => s.id === selectedServerId) || SERVERS[0];
  const selectedChannel: Channel =
    selectedServer.categories
      .flatMap((c) => c.channels)
      .find((ch) => ch.id === selectedChannelId) ||
    selectedServer.categories[0].channels[0];

  // Quick switcher filtered results
  const quickSwitcherResults = React.useMemo(() => {
    if (!quickSwitcherQuery.trim()) return [];
    const q = quickSwitcherQuery.toLowerCase();
    const results: Array<{
      type: 'server' | 'channel';
      id: string;
      name: string;
      serverId: string;
      serverName: string;
    }> = [];
    for (const server of SERVERS) {
      if (server.name.toLowerCase().includes(q)) {
        results.push({
          type: 'server',
          id: server.id,
          name: server.name,
          serverId: server.id,
          serverName: server.name,
        });
      }
      for (const cat of server.categories) {
        for (const ch of cat.channels) {
          if (ch.name.toLowerCase().includes(q)) {
            results.push({
              type: 'channel',
              id: ch.id,
              name: ch.name,
              serverId: server.id,
              serverName: server.name,
            });
          }
        }
      }
    }
    return results.slice(0, 12);
  }, [quickSwitcherQuery]);

  // Filtered friends lists
  const onlineFriends = USERS.filter((u) => u.id !== 'me' && u.status !== 'offline');
  const allFriends = USERS.filter((u) => u.id !== 'me');
  const pendingFriends: typeof USERS = []; // mock empty
  const blockedFriends: typeof USERS = []; // mock empty

  const friendsListForTab = React.useMemo(() => {
    switch (friendsTab) {
      case 'online':
        return onlineFriends;
      case 'all':
        return allFriends;
      case 'pending':
        return pendingFriends;
      case 'blocked':
        return blockedFriends;
      default:
        return onlineFriends;
    }
  }, [friendsTab]);

  // Search filtered results for mobile search view
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return { servers: [] as Server[], channels: [] as Channel[] };
    const q = searchQuery.toLowerCase();
    const servers = SERVERS.filter((s) => s.name.toLowerCase().includes(q));
    const channels: Channel[] = [];
    for (const server of SERVERS) {
      for (const cat of server.categories) {
        for (const ch of cat.channels) {
          if (ch.name.toLowerCase().includes(q)) {
            channels.push(ch);
          }
        }
      }
    }
    return { servers, channels: channels.slice(0, 10) };
  }, [searchQuery]);

  // ── Effects ────────────────────────────────────────────────────────────────

  // Resize handler: reset mobile states when transitioning to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileView('chat');
        setMobileChannelDrawerOpen(false);
        setMobileMemberDrawerOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl+K for quick switcher
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowQuickSwitcher((prev) => !prev);
        setQuickSwitcherQuery('');
      }
      // Escape closes modals in priority order
      if (e.key === 'Escape') {
        if (lightboxImage) {
          setLightboxImage(null);
        } else if (showQuickSwitcher) {
          setShowQuickSwitcher(false);
        } else if (showEmojiPicker) {
          setShowEmojiPicker(false);
        } else if (showCreateServer) {
          setShowCreateServer(false);
        } else if (showSettings) {
          setShowSettings(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage, showQuickSwitcher, showEmojiPicker, showCreateServer, showSettings]);

  // Auto-dismiss snackbars
  useEffect(() => {
    if (snackbars.length === 0) return;
    const timers = snackbars.map((snack) => {
      const duration = snack.duration || 4000;
      return setTimeout(() => {
        setSnackbars((prev) => prev.filter((s) => s.id !== snack.id));
      }, duration);
    });
    return () => timers.forEach(clearTimeout);
  }, [snackbars]);

  // ── Snackbar Helpers ───────────────────────────────────────────────────────

  const showSnackbar = useCallback(
    (message: string, action?: { label: string; onClick: () => void }, duration?: number) => {
      const id = `snack-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setSnackbars((prev) => [...prev.slice(-4), { id, message, action, duration }]);
    },
    []
  );

  const dismissSnackbar = useCallback((id: string) => {
    setSnackbars((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // ── Touch / Swipe Handlers ─────────────────────────────────────────────────

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const elapsed = Date.now() - touchStartRef.current.time;
      const velocity = Math.abs(deltaX) / elapsed;

      // Only trigger on predominantly horizontal swipes
      if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        const meetsThreshold =
          Math.abs(deltaX) > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD;

        if (meetsThreshold) {
          if (deltaX > 0) {
            // Swipe right: show channel list drawer
            setMobileChannelDrawerOpen(true);
          } else {
            // Swipe left: show member list drawer
            setMobileMemberDrawerOpen(true);
          }
        }
      }

      touchStartRef.current = null;
    },
    []
  );

  // ── Navigation Handlers ────────────────────────────────────────────────────

  const handleMobileTabSelect = useCallback(
    (tab: MobileTab) => {
      setMobileTab(tab);
      switch (tab) {
        case 'home':
          setMobileView('home');
          setIsHomeSelected(true);
          break;
        case 'servers':
          setMobileView('server-grid');
          setIsHomeSelected(false);
          break;
        case 'search':
          setMobileView('search');
          setSearchQuery('');
          break;
        case 'profile':
          setMobileView('profile');
          break;
        case 'settings':
          setShowSettings(true);
          break;
      }
    },
    []
  );

  const handleHomeSelect = useCallback(() => {
    setIsHomeSelected(true);
    if (window.innerWidth < 768) {
      setMobileView('home');
      setMobileTab('home');
    }
  }, []);

  const handleServerSelect = useCallback(
    (id: string) => {
      setSelectedServerId(id);
      setIsHomeSelected(false);
      const server = SERVERS.find((s) => s.id === id);
      if (server?.categories[0]?.channels[0]) {
        setSelectedChannelId(server.categories[0].channels[0].id);
      }
      if (window.innerWidth < 768) {
        setMobileView('channel-list');
      }
    },
    []
  );

  const handleChannelSelect = useCallback((id: string) => {
    setSelectedChannelId(id);
    if (window.innerWidth < 768) {
      setMobileView('chat');
    }
  }, []);

  const handleCreateServer = useCallback(
    (name: string) => {
      console.log('Creating server:', name);
      showSnackbar(`Server "${name}" created!`, {
        label: 'View',
        onClick: () => console.log('Navigate to new server'),
      });
    },
    [showSnackbar]
  );

  const handleQuickSwitcherSelect = useCallback(
    (item: { type: string; id: string; serverId: string }) => {
      if (item.type === 'server') {
        handleServerSelect(item.serverId);
      } else {
        setSelectedServerId(item.serverId);
        setSelectedChannelId(item.id);
        setIsHomeSelected(false);
      }
      setShowQuickSwitcher(false);
      setQuickSwitcherQuery('');
    },
    [handleServerSelect]
  );

  const handleSendMessage = useCallback((content: string) => {
    console.log('Send message:', content);
  }, []);

  // ── Render: Home / DM View ─────────────────────────────────────────────────

  const renderHomeView = (isMobile: boolean = false) => (
    <div className={`flex flex-col h-full bg-surface ${isMobile ? '' : 'flex-1'}`}>
      {/* Home Header */}
      <header className="h-12 px-4 flex items-center border-b border-outline-variant/20 bg-surface shadow-sm flex-shrink-0">
        {isMobile && (
          <button
            onClick={() => setMobileView('server-grid')}
            className="mr-2 -ml-2 p-2 text-on-surface-variant"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}
        <span className="material-symbols-outlined text-primary mr-2">forum</span>
        <h2 className="text-title-medium font-bold text-on-surface">Direct Messages</h2>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* DM Conversations List */}
        <div className="p-2">
          <div className="px-2 py-3">
            <h3 className="text-label-large font-bold text-on-surface-variant uppercase tracking-wider text-xs">
              Recent Conversations
            </h3>
          </div>
          {DM_CONVERSATIONS.map((dm) => (
            <button
              key={dm.id}
              className="w-full flex items-center p-3 rounded-xl hover:bg-surface-container-high transition-colors group animate-fade-in"
              onClick={() =>
                showSnackbar(`Opening DM with ${dm.user.username}`)
              }
            >
              <div className="relative flex-shrink-0">
                <img
                  src={dm.user.avatar}
                  alt={dm.user.username}
                  className="w-10 h-10 rounded-full"
                />
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface ${
                    dm.user.status === 'online'
                      ? 'bg-green-500'
                      : dm.user.status === 'idle'
                      ? 'bg-yellow-500'
                      : dm.user.status === 'dnd'
                      ? 'bg-red-500'
                      : 'bg-gray-500'
                  }`}
                />
              </div>
              <div className="ml-3 flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-body-medium font-medium truncate ${
                      dm.unread ? 'text-on-surface font-bold' : 'text-on-surface-variant'
                    }`}
                  >
                    {dm.user.username}
                  </span>
                  <span className="text-label-small text-on-surface-variant ml-2 flex-shrink-0">
                    {dm.lastMessageTime}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-body-small text-on-surface-variant truncate">
                    {dm.lastMessage}
                  </span>
                  {dm.unreadCount && dm.unreadCount > 0 && (
                    <span className="ml-2 flex-shrink-0 min-w-[20px] h-5 bg-primary text-on-primary text-label-small font-bold rounded-full flex items-center justify-center px-1.5 animate-badge-bounce">
                      {dm.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="mx-4 my-2 h-px bg-outline-variant/30" />

        {/* Friends List */}
        <div className="p-2">
          <div className="px-2 py-3 flex items-center justify-between">
            <h3 className="text-label-large font-bold text-on-surface-variant uppercase tracking-wider text-xs">
              Friends
            </h3>
            <button className="p-1 rounded-full hover:bg-surface-container-high text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">person_add</span>
            </button>
          </div>

          {/* M3 Segmented Buttons for friends tabs */}
          <div className="flex mx-2 mb-3 bg-surface-container-high rounded-full p-0.5 overflow-hidden">
            {(
              [
                { id: 'online', label: 'Online' },
                { id: 'all', label: 'All' },
                { id: 'pending', label: 'Pending' },
                { id: 'blocked', label: 'Blocked' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFriendsTab(tab.id)}
                className={`flex-1 py-2 text-label-medium font-medium rounded-full transition-all duration-200 ${
                  friendsTab === tab.id
                    ? 'bg-secondary-container text-on-secondary-container shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Friends list content */}
          <div className="space-y-0.5 animate-fade-in">
            {friendsListForTab.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 opacity-50">
                <span className="material-symbols-outlined text-[48px] text-outline mb-3">
                  {friendsTab === 'pending'
                    ? 'hourglass_empty'
                    : friendsTab === 'blocked'
                    ? 'block'
                    : 'group_off'}
                </span>
                <p className="text-body-medium text-on-surface-variant">
                  {friendsTab === 'pending'
                    ? 'No pending requests'
                    : friendsTab === 'blocked'
                    ? 'No blocked users'
                    : 'No friends found'}
                </p>
              </div>
            ) : (
              friendsListForTab.map((user) => (
                <button
                  key={user.id}
                  className="w-full flex items-center p-2.5 rounded-xl hover:bg-surface-container-high transition-colors group"
                  onClick={() =>
                    showSnackbar(`Opening DM with ${user.username}`)
                  }
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-9 h-9 rounded-full"
                    />
                    <div
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-surface ${
                        user.status === 'online'
                          ? 'bg-green-500'
                          : user.status === 'idle'
                          ? 'bg-yellow-500'
                          : user.status === 'dnd'
                          ? 'bg-red-500'
                          : 'bg-gray-500'
                      }`}
                    />
                  </div>
                  <div className="ml-3 flex-1 min-w-0 text-left">
                    <span
                      className="text-body-medium font-medium truncate block"
                      style={{ color: user.roleColor || undefined }}
                    >
                      {user.username}
                    </span>
                    {user.activity && (
                      <span className="text-label-small text-on-surface-variant truncate block opacity-70">
                        {user.statusEmoji ? `${user.statusEmoji} ` : ''}
                        {user.activity}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-full hover:bg-surface-container-highest text-on-surface-variant transition-colors">
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                    </button>
                    <button className="p-1.5 rounded-full hover:bg-surface-container-highest text-on-surface-variant transition-colors">
                      <span className="material-symbols-outlined text-[18px]">call</span>
                    </button>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ── Render: Mobile Search View ─────────────────────────────────────────────

  const renderMobileSearchView = () => (
    <div className="flex flex-col h-full bg-surface animate-fade-in">
      {/* M3 Search Bar */}
      <div className="p-4 pb-2">
        <div className="flex items-center bg-surface-container-highest rounded-full px-4 py-3 shadow-elevation-1 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
          <span className="material-symbols-outlined text-on-surface-variant mr-3">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search servers, channels, messages..."
            className="flex-1 bg-transparent text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none text-body-large"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-full hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                close
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto px-4 no-scrollbar">
        {!searchQuery.trim() ? (
          <div className="flex flex-col items-center justify-center h-full opacity-40">
            <span className="material-symbols-outlined text-[64px] text-outline mb-4">
              manage_search
            </span>
            <p className="text-body-large text-on-surface-variant">
              Search for anything
            </p>
            <p className="text-body-small text-on-surface-variant mt-1">
              Servers, channels, and messages
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-2 animate-slide-up">
            {/* Server Results */}
            {searchResults.servers.length > 0 && (
              <div>
                <h4 className="text-label-medium font-bold text-on-surface-variant uppercase tracking-wider mb-2 px-1">
                  Servers
                </h4>
                {searchResults.servers.map((server) => (
                  <button
                    key={server.id}
                    onClick={() => handleServerSelect(server.id)}
                    className="w-full flex items-center p-3 rounded-xl hover:bg-surface-container-high transition-colors"
                  >
                    <img
                      src={server.icon}
                      alt={server.name}
                      className="w-10 h-10 rounded-[12px]"
                    />
                    <div className="ml-3 text-left">
                      <span className="text-body-medium font-medium text-on-surface block">
                        {server.name}
                      </span>
                      <span className="text-label-small text-on-surface-variant">
                        {server.categories.reduce((sum, c) => sum + c.channels.length, 0)} channels
                      </span>
                    </div>
                    <span className="material-symbols-outlined ml-auto text-on-surface-variant text-[20px]">
                      arrow_forward
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Channel Results */}
            {searchResults.channels.length > 0 && (
              <div>
                <h4 className="text-label-medium font-bold text-on-surface-variant uppercase tracking-wider mb-2 px-1">
                  Channels
                </h4>
                {searchResults.channels.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      // Find which server owns this channel
                      for (const server of SERVERS) {
                        for (const cat of server.categories) {
                          if (cat.channels.find((c) => c.id === ch.id)) {
                            setSelectedServerId(server.id);
                            setSelectedChannelId(ch.id);
                            setIsHomeSelected(false);
                            setMobileView('chat');
                            return;
                          }
                        }
                      }
                    }}
                    className="w-full flex items-center p-3 rounded-xl hover:bg-surface-container-high transition-colors"
                  >
                    <div className="w-10 h-10 rounded-[12px] bg-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant">
                        {ch.type === 'voice' ? 'volume_up' : 'tag'}
                      </span>
                    </div>
                    <div className="ml-3 text-left">
                      <span className="text-body-medium font-medium text-on-surface block">
                        {ch.name}
                      </span>
                      {ch.topic && (
                        <span className="text-label-small text-on-surface-variant truncate block max-w-[200px]">
                          {ch.topic}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No results */}
            {searchResults.servers.length === 0 && searchResults.channels.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 opacity-50">
                <span className="material-symbols-outlined text-[48px] text-outline mb-3">
                  search_off
                </span>
                <p className="text-body-medium text-on-surface-variant">
                  No results for "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // ── Render: Mobile Profile Quick View ──────────────────────────────────────

  const renderMobileProfileView = () => (
    <div className="flex flex-col h-full bg-surface animate-fade-in">
      {/* Profile Banner */}
      <div className="relative h-32 bg-primary overflow-hidden flex-shrink-0">
        {CURRENT_USER.banner && (
          <img
            src={CURRENT_USER.banner}
            alt="Banner"
            className="w-full h-full object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface/80" />
      </div>

      {/* Avatar overlapping banner */}
      <div className="relative px-4 -mt-10">
        <div className="relative inline-block">
          <img
            src={CURRENT_USER.avatar}
            alt={CURRENT_USER.username}
            className="w-20 h-20 rounded-full border-4 border-surface"
          />
          <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-surface" />
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 mt-3 flex-1 overflow-y-auto no-scrollbar">
        <h2 className="text-headline-small font-bold text-on-surface">
          {CURRENT_USER.username}
        </h2>
        <p className="text-body-medium text-on-surface-variant">
          #{CURRENT_USER.discriminator}
        </p>

        {CURRENT_USER.aboutMe && (
          <div className="mt-4 p-3 bg-surface-container rounded-xl">
            <h4 className="text-label-medium font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              About Me
            </h4>
            <p className="text-body-medium text-on-surface">{CURRENT_USER.aboutMe}</p>
          </div>
        )}

        {CURRENT_USER.roles && CURRENT_USER.roles.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {CURRENT_USER.roles.map((role) => (
              <span
                key={role}
                className="px-3 py-1 bg-primary-container text-on-primary-container text-label-medium font-medium rounded-full"
              >
                {role}
              </span>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 space-y-1">
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center p-3 rounded-xl hover:bg-surface-container-high transition-colors text-left"
          >
            <span className="material-symbols-outlined text-on-surface-variant mr-3">
              settings
            </span>
            <span className="text-body-large text-on-surface">Settings</span>
            <span className="material-symbols-outlined ml-auto text-on-surface-variant text-[20px]">
              chevron_right
            </span>
          </button>
          <button
            className="w-full flex items-center p-3 rounded-xl hover:bg-surface-container-high transition-colors text-left"
            onClick={() => showSnackbar('Status updated!')}
          >
            <span className="material-symbols-outlined text-on-surface-variant mr-3">
              mood
            </span>
            <span className="text-body-large text-on-surface">Set Status</span>
            <span className="material-symbols-outlined ml-auto text-on-surface-variant text-[20px]">
              chevron_right
            </span>
          </button>
          <button
            className="w-full flex items-center p-3 rounded-xl hover:bg-surface-container-high transition-colors text-left"
            onClick={() => showSnackbar('Switching accounts...')}
          >
            <span className="material-symbols-outlined text-on-surface-variant mr-3">
              switch_account
            </span>
            <span className="text-body-large text-on-surface">Switch Account</span>
            <span className="material-symbols-outlined ml-auto text-on-surface-variant text-[20px]">
              chevron_right
            </span>
          </button>
        </div>

        {/* Online status indicator */}
        <div className="mt-6 p-3 bg-surface-container rounded-xl flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse-glow" />
          <span className="text-body-medium text-on-surface">Online</span>
          <button className="ml-auto text-label-medium text-primary hover:underline">
            Change
          </button>
        </div>
      </div>
    </div>
  );

  // ── Render: Mobile Content ─────────────────────────────────────────────────

  const renderMobileContent = () => {
    switch (mobileView) {
      case 'server-grid':
        return (
          <div className="h-full animate-fade-in">
            <ServerGrid
              onServerSelect={handleServerSelect}
              onAddServer={() => setShowCreateServer(true)}
            />
          </div>
        );

      case 'channel-list':
        return (
          <div className="h-full bg-surface-container animate-slide-up">
            {/* Back Button header */}
            <div className="h-12 flex items-center px-4 border-b border-outline-variant/20 flex-shrink-0">
              <button
                onClick={() => setMobileView('server-grid')}
                className="mr-3 p-1 rounded-full hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface">arrow_back</span>
              </button>
              <div className="flex items-center overflow-hidden">
                <img
                  src={selectedServer.icon}
                  alt={selectedServer.name}
                  className="w-6 h-6 rounded-[8px] mr-2"
                />
                <span className="text-title-medium font-bold text-on-surface truncate">
                  {selectedServer.name}
                </span>
              </div>
            </div>
            <ChannelSidebar
              server={selectedServer}
              selectedChannelId={selectedChannelId}
              onChannelSelect={handleChannelSelect}
              mobileOpen={true}
              onOpenSettings={() => setShowSettings(true)}
            />
          </div>
        );

      case 'chat':
        return (
          <div
            ref={chatAreaRef}
            className="flex flex-col h-full"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Mobile Chat Header */}
            <div className="h-14 bg-surface-container flex items-center justify-between px-4 border-b border-outline-variant/20 flex-shrink-0 z-10">
              <div className="flex items-center overflow-hidden">
                <button
                  onClick={() => setMobileView('channel-list')}
                  className="mr-2 -ml-2 p-2 rounded-full hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-on-surface">arrow_back</span>
                </button>
                <span className="text-title-medium font-bold text-on-surface truncate">
                  #{selectedChannel.name}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setShowQuickSwitcher(true)}
                  className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">search</span>
                </button>
                <button
                  onClick={() => setMobileMemberDrawerOpen(true)}
                  className="p-2 -mr-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">group</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
              <ChatArea
                channel={selectedChannel}
                messages={MESSAGES}
                onSendMessage={handleSendMessage}
                onToggleMemberList={() => setMobileMemberDrawerOpen(true)}
                isMemberListOpen={false}
              />
            </div>
          </div>
        );

      case 'home':
        return renderHomeView(true);

      case 'search':
        return renderMobileSearchView();

      case 'profile':
        return renderMobileProfileView();

      default:
        return null;
    }
  };

  // ── Render: Quick Switcher Modal ───────────────────────────────────────────

  const renderQuickSwitcher = () => {
    if (!showQuickSwitcher) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 animate-fade-in">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => {
            setShowQuickSwitcher(false);
            setQuickSwitcherQuery('');
          }}
        />

        {/* Modal */}
        <div className="relative w-full max-w-lg bg-surface-container rounded-[28px] shadow-elevation-5 overflow-hidden animate-scale-in">
          {/* Search Input */}
          <div className="p-4 border-b border-outline-variant/20">
            <div className="flex items-center bg-surface-container-high rounded-full px-4 py-2.5">
              <span className="material-symbols-outlined text-on-surface-variant mr-3">
                search
              </span>
              <input
                type="text"
                value={quickSwitcherQuery}
                onChange={(e) => setQuickSwitcherQuery(e.target.value)}
                placeholder="Where would you like to go?"
                className="flex-1 bg-transparent text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none text-body-large"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setShowQuickSwitcher(false);
                    setQuickSwitcherQuery('');
                  }
                  if (e.key === 'Enter' && quickSwitcherResults.length > 0) {
                    handleQuickSwitcherSelect(quickSwitcherResults[0]);
                  }
                }}
              />
              <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 bg-surface-container-highest rounded text-label-small text-on-surface-variant font-mono">
                ESC
              </kbd>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-[300px] overflow-y-auto py-2 no-scrollbar">
            {quickSwitcherQuery.trim() === '' ? (
              <div className="px-4 py-6 text-center">
                <p className="text-body-medium text-on-surface-variant opacity-60">
                  Type to search servers and channels
                </p>
                <div className="mt-2 flex items-center justify-center space-x-2">
                  <kbd className="px-2 py-0.5 bg-surface-container-highest rounded text-label-small text-on-surface-variant font-mono">
                    {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
                  </kbd>
                  <span className="text-label-small text-on-surface-variant">+</span>
                  <kbd className="px-2 py-0.5 bg-surface-container-highest rounded text-label-small text-on-surface-variant font-mono">
                    K
                  </kbd>
                  <span className="text-label-small text-on-surface-variant ml-1">
                    to toggle
                  </span>
                </div>
              </div>
            ) : quickSwitcherResults.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <span className="material-symbols-outlined text-[36px] text-outline mb-2">
                  search_off
                </span>
                <p className="text-body-medium text-on-surface-variant">
                  No results found
                </p>
              </div>
            ) : (
              quickSwitcherResults.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleQuickSwitcherSelect(item)}
                  className="w-full flex items-center px-4 py-2.5 hover:bg-primary-container/30 transition-colors group text-left"
                >
                  <span className="material-symbols-outlined text-[20px] text-on-surface-variant mr-3 group-hover:text-primary">
                    {item.type === 'server' ? 'dns' : 'tag'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-body-medium font-medium text-on-surface truncate block group-hover:text-primary">
                      {item.name}
                    </span>
                    {item.type === 'channel' && (
                      <span className="text-label-small text-on-surface-variant">
                        in {item.serverName}
                      </span>
                    )}
                  </div>
                  <span className="text-label-small text-on-surface-variant uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    Jump
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2 border-t border-outline-variant/20 flex items-center justify-between text-label-small text-on-surface-variant">
            <span>Quick Switcher</span>
            <div className="flex items-center space-x-1">
              <span className="material-symbols-outlined text-[14px]">keyboard_return</span>
              <span>to select</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Render: Image Lightbox ─────────────────────────────────────────────────

  const renderLightbox = () => {
    if (!lightboxImage) return null;

    return (
      <div
        className="lightbox-overlay animate-fade-in"
        onClick={() => setLightboxImage(null)}
      >
        <img
          src={lightboxImage}
          alt="Lightbox"
          className="animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={() => setLightboxImage(null)}
          className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
    );
  };

  // ── Render: Snackbar System ────────────────────────────────────────────────

  const renderSnackbars = () => {
    if (snackbars.length === 0) return null;

    return (
      <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[90] flex flex-col items-center space-y-2 w-full max-w-md px-4 pointer-events-none">
        {snackbars.map((snack) => (
          <div
            key={snack.id}
            className="w-full bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-[12px] shadow-elevation-3 flex items-center justify-between pointer-events-auto animate-toast-enter"
            style={{
              backgroundColor: 'var(--md-sys-color-on-surface, #E3E2E6)',
              color: 'var(--md-sys-color-surface, #1B1B1F)',
            }}
          >
            <span className="text-body-medium flex-1 mr-3">{snack.message}</span>
            <div className="flex items-center space-x-2 flex-shrink-0">
              {snack.action && (
                <button
                  onClick={() => {
                    snack.action!.onClick();
                    dismissSnackbar(snack.id);
                  }}
                  className="text-label-large font-bold hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--md-sys-color-primary-container, #D2E4FF)' }}
                >
                  {snack.action.label}
                </button>
              )}
              <button
                onClick={() => dismissSnackbar(snack.id)}
                className="p-0.5 rounded-full hover:opacity-80 transition-opacity"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ── Render: Mobile Overlay Drawers ─────────────────────────────────────────

  const renderMobileChannelDrawer = () => {
    if (!isMobileChannelDrawerOpen) return null;

    return (
      <div className="fixed inset-0 z-50 md:hidden">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 animate-fade-in"
          onClick={() => setMobileChannelDrawerOpen(false)}
        />
        {/* Drawer */}
        <div className="absolute inset-y-0 left-0 w-[85%] max-w-[320px] bg-surface-container shadow-elevation-5 animate-slide-right z-10"
          style={{ animation: 'slide-from-left 300ms cubic-bezier(0.05, 0.7, 0.1, 1)' }}
        >
          <div className="h-12 flex items-center px-4 border-b border-outline-variant/20">
            <button
              onClick={() => setMobileChannelDrawerOpen(false)}
              className="mr-3 p-1 rounded-full hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <span className="text-title-medium font-bold text-on-surface truncate">
              {selectedServer.name}
            </span>
          </div>
          <div className="h-[calc(100%-48px)] overflow-y-auto">
            <ChannelSidebar
              server={selectedServer}
              selectedChannelId={selectedChannelId}
              onChannelSelect={(id) => {
                handleChannelSelect(id);
                setMobileChannelDrawerOpen(false);
              }}
              mobileOpen={true}
              onCloseMobile={() => setMobileChannelDrawerOpen(false)}
              onOpenSettings={() => {
                setMobileChannelDrawerOpen(false);
                setShowSettings(true);
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderMobileMemberDrawer = () => {
    if (!isMobileMemberDrawerOpen) return null;

    return (
      <div className="fixed inset-0 z-50 md:hidden">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 animate-fade-in"
          onClick={() => setMobileMemberDrawerOpen(false)}
        />
        {/* Drawer from right */}
        <div className="absolute inset-y-0 right-0 w-[280px] bg-surface-container-low shadow-elevation-5 z-10"
          style={{ animation: 'slide-from-right 300ms cubic-bezier(0.05, 0.7, 0.1, 1)' }}
        >
          <div className="h-12 flex items-center justify-between px-4 border-b border-outline-variant/20">
            <span className="text-title-small font-bold text-on-surface-variant uppercase tracking-wider">
              Members
            </span>
            <button
              onClick={() => setMobileMemberDrawerOpen(false)}
              className="p-1 rounded-full hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant">close</span>
            </button>
          </div>
          <div className="h-[calc(100%-48px)] overflow-y-auto no-scrollbar">
            <MemberSidebar
              users={USERS}
              isOpen={true}
              onCloseMobile={() => setMobileMemberDrawerOpen(false)}
            />
          </div>
        </div>
      </div>
    );
  };

  // ── Inline Keyframes (for drawer animations not in index.css) ──────────────

  const drawerAnimationStyles = `
    @keyframes slide-from-left {
      from { transform: translateX(-100%); }
      to { transform: translateX(0); }
    }
    @keyframes slide-from-right {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
  `;

  // ── Main Render ────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen w-screen bg-background text-on-surface overflow-hidden">
      {/* Inline styles for drawer animations */}
      <style>{drawerAnimationStyles}</style>

      {/* ═══ DESKTOP LAYOUT (md+) ═══ */}
      <div className="hidden md:flex flex-row w-full h-full">
        {/* 1. Server Rail (72px) */}
        <ServerRail
          selectedServerId={isHomeSelected ? undefined : selectedServerId}
          onServerSelect={handleServerSelect}
          onHomeSelect={handleHomeSelect}
          isHomeSelected={isHomeSelected}
          onAddServer={() => setShowCreateServer(true)}
        />

        {/* 2. Channel Sidebar (240px) */}
        {!isHomeSelected && (
          <div className="w-60 bg-surface-container border-r border-outline-variant/20 flex-shrink-0 flex flex-col">
            <ChannelSidebar
              server={selectedServer}
              selectedChannelId={selectedChannelId}
              onChannelSelect={handleChannelSelect}
              mobileOpen={false}
              onOpenSettings={() => setShowSettings(true)}
            />
          </div>
        )}

        {/* Home sidebar for DMs when home is selected */}
        {isHomeSelected && (
          <div className="w-60 bg-surface-container border-r border-outline-variant/20 flex-shrink-0 flex flex-col">
            {/* Home sidebar header */}
            <div className="h-12 px-4 flex items-center border-b border-outline-variant/20 shadow-sm">
              <div className="flex items-center bg-surface-container-high rounded-full px-3 py-1.5 flex-1 cursor-pointer hover:bg-surface-container-highest transition-colors"
                onClick={() => setShowQuickSwitcher(true)}
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[18px] mr-2">
                  search
                </span>
                <span className="text-body-small text-on-surface-variant">
                  Find or start a conversation
                </span>
              </div>
            </div>

            {/* DM List in sidebar */}
            <div className="flex-1 overflow-y-auto py-2 no-scrollbar">
              <div className="px-3 py-2">
                <button className="w-full flex items-center px-3 py-2 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-[20px] mr-3">group</span>
                  <span className="text-label-large">Friends</span>
                </button>
              </div>
              <div className="px-4 py-2">
                <h4 className="text-label-medium font-bold text-on-surface-variant uppercase tracking-wider text-xs">
                  Direct Messages
                </h4>
              </div>
              {DM_CONVERSATIONS.map((dm) => (
                <button
                  key={dm.id}
                  className="w-full flex items-center px-3 py-2 mx-1 rounded-lg hover:bg-surface-container-high transition-colors group"
                  style={{ width: 'calc(100% - 8px)' }}
                  onClick={() => showSnackbar(`Opening DM with ${dm.user.username}`)}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={dm.user.avatar}
                      alt={dm.user.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <div
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-surface-container ${
                        dm.user.status === 'online'
                          ? 'bg-green-500'
                          : dm.user.status === 'idle'
                          ? 'bg-yellow-500'
                          : dm.user.status === 'dnd'
                          ? 'bg-red-500'
                          : 'bg-gray-500'
                      }`}
                    />
                  </div>
                  <div className="ml-2 flex-1 min-w-0 text-left">
                    <span
                      className={`text-body-medium truncate block ${
                        dm.unread ? 'font-bold text-on-surface' : 'text-on-surface-variant'
                      }`}
                    >
                      {dm.user.username}
                    </span>
                    <span className="text-label-small text-on-surface-variant truncate block opacity-70">
                      {dm.lastMessage}
                    </span>
                  </div>
                  {dm.unreadCount && dm.unreadCount > 0 && (
                    <span className="ml-1 min-w-[18px] h-[18px] bg-primary text-on-primary text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {dm.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* User Bar (same as channel sidebar) */}
            <div className="h-[52px] bg-surface-container-high px-2 flex items-center justify-between shrink-0 border-t border-outline-variant/20">
              <div className="flex items-center p-1 rounded-md hover:bg-surface-container-highest cursor-pointer group mr-auto">
                <div className="relative">
                  <img
                    src={CURRENT_USER.avatar}
                    alt="Me"
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-surface-container-high" />
                </div>
                <div className="ml-2 text-sm overflow-hidden">
                  <div className="text-on-surface font-medium truncate max-w-[80px]">
                    {CURRENT_USER.username}
                  </div>
                  <div className="text-on-surface-variant text-xs truncate max-w-[80px]">
                    #{CURRENT_USER.discriminator}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <button className="p-1.5 rounded-full hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-[20px]">mic</span>
                </button>
                <button className="p-1.5 rounded-full hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-[20px]">headset</span>
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-1.5 rounded-full hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">settings</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Main Content Area (flex) */}
        {isHomeSelected ? (
          renderHomeView(false)
        ) : (
          <ChatArea
            channel={selectedChannel}
            messages={MESSAGES}
            onSendMessage={handleSendMessage}
            onToggleMemberList={() => setMemberSidebarOpen(!isMemberSidebarOpen)}
            isMemberListOpen={isMemberSidebarOpen}
          />
        )}

        {/* 4. Member Sidebar (240px, toggleable) */}
        {isMemberSidebarOpen && !isHomeSelected && (
          <div className="animate-fade-in">
            <MemberSidebar users={USERS} isOpen={true} />
          </div>
        )}
      </div>

      {/* ═══ MOBILE LAYOUT (<md) ═══ */}
      <div className="md:hidden flex flex-col w-full h-full relative">
        {/* Main mobile content area */}
        <div className="flex-1 overflow-hidden">{renderMobileContent()}</div>

        {/* Mobile Channel Drawer (swipe right overlay) */}
        {renderMobileChannelDrawer()}

        {/* Mobile Member Drawer (swipe left overlay) */}
        {renderMobileMemberDrawer()}

        {/* Bottom Navigation */}
        <MobileNav
          activeTab={mobileTab}
          onTabSelect={handleMobileTabSelect}
        />
        {/* Safe area spacer for bottom nav (nav is fixed, content needs clearance) */}
        <div className="h-16 flex-shrink-0" />
      </div>

      {/* ═══ MODALS & OVERLAYS ═══ */}

      {/* Settings Panel */}
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Create Server Modal */}
      {showCreateServer && (
        <CreateServerModal
          onClose={() => setShowCreateServer(false)}
          onCreate={handleCreateServer}
        />
      )}

      {/* Quick Switcher (Cmd/Ctrl+K) */}
      {renderQuickSwitcher()}

      {/* Image Lightbox */}
      {renderLightbox()}

      {/* Snackbar / Toast System */}
      {renderSnackbars()}
    </div>
  );
};
