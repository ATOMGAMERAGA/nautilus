import React, { useState } from 'react';
import { CURRENT_USER } from '../../data/mock';
import type { Server, Channel } from '../../data/mock';

interface ChannelSidebarProps {
  server: Server;
  selectedChannelId?: string;
  onChannelSelect: (channelId: string) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenSettings: () => void;
}

export const ChannelSidebar: React.FC<ChannelSidebarProps> = ({
  server,
  selectedChannelId,
  onChannelSelect,
  mobileOpen = false,
  onCloseMobile,
  onOpenSettings
}) => {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [showServerMenu, setShowServerMenu] = useState(false);

  const toggleCategory = (catId: string) => {
    const newSet = new Set(collapsedCategories);
    if (newSet.has(catId)) newSet.delete(catId);
    else newSet.add(catId);
    setCollapsedCategories(newSet);
  };

  const isCollapsed = (catId: string) => collapsedCategories.has(catId);

  const toggleMute = () => {
    if (isDeafened) { setIsDeafened(false); setIsMuted(false); }
    else setIsMuted(!isMuted);
  };

  const toggleDeafen = () => {
    if (!isDeafened) { setIsDeafened(true); setIsMuted(true); }
    else { setIsDeafened(false); setIsMuted(false); }
  };

  const getChannelIcon = (channel: Channel) => {
    if (channel.type === 'voice') return 'volume_up';
    if (channel.type === 'announcement') return 'campaign';
    return 'tag';
  };

  const renderChannel = (channel: Channel) => {
    const isSelected = selectedChannelId === channel.id;
    const isVoice = channel.type === 'voice';

    return (
      <div key={channel.id} className="mb-0.5">
        <button
          onClick={() => {
            onChannelSelect(channel.id);
            if (window.innerWidth < 768) onCloseMobile?.();
          }}
          className={`w-[calc(100%-16px)] flex items-center px-2 py-1.5 mx-2 rounded-lg transition-all duration-200 group state-layer min-h-[34px]
            ${isSelected
              ? 'bg-secondary-container text-on-secondary-container'
              : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }
          `}
          aria-label={`${channel.type} channel ${channel.name}${channel.unread ? ' - unread' : ''}`}
          aria-current={isSelected ? 'true' : undefined}
        >
          <span className="material-symbols-outlined text-[20px] mr-1.5 opacity-60 flex-shrink-0">
            {getChannelIcon(channel)}
          </span>
          <span className={`text-body-medium truncate flex-1 text-left ${channel.unread && !isSelected ? 'font-bold text-on-surface' : ''}`}>
            {channel.name}
          </span>
          {/* Mention badge */}
          {channel.mentionCount && channel.mentionCount > 0 && (
            <span className="ml-auto min-w-[18px] h-[18px] bg-error text-on-error text-[11px] font-bold rounded-full flex items-center justify-center px-1 flex-shrink-0">
              {channel.mentionCount}
            </span>
          )}
          {/* Unread dot (no mentions) */}
          {channel.unread && !channel.mentionCount && !isSelected && (
            <div className="ml-auto w-2 h-2 rounded-full bg-on-surface flex-shrink-0" />
          )}
          {/* Action buttons on hover */}
          {!isVoice && (
            <div className="ml-1 flex items-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <span className="material-symbols-outlined text-[16px] p-0.5 hover:text-primary cursor-pointer">person_add</span>
              <span className="material-symbols-outlined text-[16px] p-0.5 hover:text-primary cursor-pointer">settings</span>
            </div>
          )}
        </button>

        {/* Connected Users for Voice Channels */}
        {isVoice && channel.connectedUsers && channel.connectedUsers.length > 0 && (
          <div className="ml-9 mt-0.5 space-y-0.5 animate-fade-in">
            {channel.connectedUsers.map(user => (
              <div key={user.id} className="flex items-center group/user cursor-pointer p-1 rounded-md hover:bg-surface-container-highest w-fit pr-2 max-w-[200px]">
                <div className="relative flex-shrink-0">
                  <img src={user.avatar} alt={user.username} className="w-5 h-5 rounded-full" />
                  {/* Speaking indicator would go here */}
                </div>
                <span className="text-label-small text-on-surface-variant group-hover/user:text-on-surface truncate ml-1.5">
                  {user.username}
                </span>
                {/* Mute/deafen icons for user */}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden animate-fade-in"
          onClick={onCloseMobile}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 w-[85%] max-w-[300px] z-40 bg-surface-container flex flex-col
        transform transition-transform duration-300 ease-emphasized
        md:relative md:transform-none md:w-60 md:flex
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Server Header */}
        <div
          className="h-12 px-4 flex items-center justify-between border-b border-outline-variant/10 cursor-pointer hover:bg-surface-container-high transition-colors flex-shrink-0 relative"
          onClick={() => setShowServerMenu(!showServerMenu)}
          role="button"
          aria-label="Server settings"
        >
          <h1 className="text-title-medium font-bold truncate text-on-surface">
            {server.name}
          </h1>
          <span className={`material-symbols-outlined text-on-surface-variant text-[20px] transition-transform duration-200 ${showServerMenu ? 'rotate-180' : ''}`}>
            expand_more
          </span>

          {/* Server dropdown menu */}
          {showServerMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowServerMenu(false); }} />
              <div className="absolute top-full left-2 right-2 mt-1 bg-surface-container-highest rounded-lg shadow-elevation-3 py-1.5 z-50 animate-scale-in">
                {[
                  { icon: 'rocket_launch', label: 'Server Boost' },
                  { icon: 'person_add', label: 'Invite People' },
                  { icon: 'settings', label: 'Server Settings' },
                  { icon: 'folder', label: 'Create Category' },
                  { icon: 'add', label: 'Create Channel' },
                  { icon: 'notifications', label: 'Notification Settings' },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="w-full flex items-center px-3 py-2 text-body-medium text-on-surface hover:bg-primary hover:text-on-primary transition-colors"
                    onClick={(e) => { e.stopPropagation(); setShowServerMenu(false); }}
                  >
                    <span className="material-symbols-outlined text-[18px] mr-3">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
                <div className="h-px bg-outline-variant/20 my-1" />
                <button className="w-full flex items-center px-3 py-2 text-body-medium text-error hover:bg-error/10 transition-colors">
                  <span className="material-symbols-outlined text-[18px] mr-3">logout</span>
                  Leave Server
                </button>
              </div>
            </>
          )}
        </div>

        {/* Server Banner */}
        {server.banner && (
          <div className="h-[120px] w-full bg-cover bg-center relative flex-shrink-0 overflow-hidden" style={{ backgroundImage: `url(${server.banner})` }}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface-container" />
          </div>
        )}

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto py-2 space-y-3 thin-scrollbar">
          {server.categories.map(category => (
            <div key={category.id}>
              {/* Category Header */}
              <div
                className="px-2 flex items-center justify-between cursor-pointer text-on-surface-variant hover:text-on-surface mb-0.5 group/cat py-1"
                onClick={() => toggleCategory(category.id)}
                role="button"
                aria-expanded={!isCollapsed(category.id)}
              >
                <div className="flex items-center text-[11px] font-bold uppercase tracking-wider">
                  <span
                    className="material-symbols-outlined text-[12px] mr-0.5 transition-transform duration-200"
                    style={{ transform: isCollapsed(category.id) ? 'rotate(-90deg)' : 'rotate(0deg)' }}
                  >
                    expand_more
                  </span>
                  {category.name}
                </div>
                <button
                  className="opacity-0 group-hover/cat:opacity-100 transition-opacity p-0.5 hover:text-primary"
                  onClick={(e) => { e.stopPropagation(); }}
                  aria-label={`Add channel to ${category.name}`}
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
              </div>

              {/* Channels */}
              <div className={`transition-all duration-300 ease-standard origin-top ${
                isCollapsed(category.id)
                  ? 'max-h-0 overflow-hidden opacity-0'
                  : 'max-h-[2000px] opacity-100'
              }`}>
                {category.channels.map(renderChannel)}
              </div>
            </div>
          ))}
        </div>

        {/* User Bar */}
        <div className="h-[52px] bg-surface-container-lowest px-2 flex items-center justify-between flex-shrink-0 border-t border-outline-variant/10">
          <div className="flex items-center p-1 rounded-lg hover:bg-surface-container-high cursor-pointer group/user mr-auto max-w-[60%]">
            <div className="relative flex-shrink-0">
              <img src={CURRENT_USER.avatar} alt="Me" className="w-8 h-8 rounded-full" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-surface-container-lowest" />
            </div>
            <div className="ml-2 overflow-hidden">
              <div className="text-body-small font-medium truncate text-on-surface leading-tight">{CURRENT_USER.username}</div>
              <div className="text-label-small text-on-surface-variant truncate leading-tight">Online</div>
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={toggleMute}
              className={`p-1.5 rounded-full transition-colors ${
                isMuted
                  ? 'text-error hover:bg-error/10'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isMuted ? 'mic_off' : 'mic'}
              </span>
            </button>
            <button
              onClick={toggleDeafen}
              className={`p-1.5 rounded-full transition-colors ${
                isDeafened
                  ? 'text-error hover:bg-error/10'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
              aria-label={isDeafened ? 'Undeafen' : 'Deafen'}
              title={isDeafened ? 'Undeafen' : 'Deafen'}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isDeafened ? 'headset_off' : 'headset'}
              </span>
            </button>
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
              aria-label="User Settings"
              title="User Settings"
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
