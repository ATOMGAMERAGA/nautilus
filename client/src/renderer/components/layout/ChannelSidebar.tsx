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
  const [showServerMenu, setShowServerMenu] = useState(false);

  const toggleCategory = (catId: string) => {
    const newSet = new Set(collapsedCategories);
    if (newSet.has(catId)) newSet.delete(catId);
    else newSet.add(catId);
    setCollapsedCategories(newSet);
  };

  const isCollapsed = (catId: string) => collapsedCategories.has(catId);

  const getChannelIcon = (channel: Channel) => {
    if (channel.type === 'voice') return 'volume_up';
    if (channel.type === 'announcement') return 'campaign';
    return 'tag';
  };

  const renderChannel = (channel: Channel) => {
    const isSelected = selectedChannelId === channel.id;
    const isVoice = channel.type === 'voice';

    return (
      <div key={channel.id} className="px-3 mb-1">
        <button
          onClick={() => {
            onChannelSelect(channel.id);
            if (window.innerWidth < 768) onCloseMobile?.();
          }}
          className={`w-full flex items-center h-14 px-4 rounded-full transition-all duration-200 group state-layer
            ${isSelected
              ? 'bg-secondary-container text-on-secondary-container'
              : 'text-on-surface-variant hover:bg-on-surface/[0.08] hover:text-on-surface'
            }
          `}
          aria-label={`${channel.type} channel ${channel.name}${channel.unread ? ' - unread' : ''}`}
          aria-current={isSelected ? 'true' : undefined}
        >
          <span className={`material-symbols-outlined text-[24px] mr-3 flex-shrink-0 ${isSelected ? 'filled' : 'opacity-70'}`}>
            {getChannelIcon(channel)}
          </span>
          <span className={`text-label-large truncate flex-1 text-left ${channel.unread && !isSelected ? 'font-bold text-on-surface' : ''}`}>
            {channel.name}
          </span>
          {/* Mention badge */}
          {channel.mentionCount && channel.mentionCount > 0 && (
            <span className="ml-2 min-w-[20px] h-5 bg-error text-on-error text-label-small font-bold rounded-full flex items-center justify-center px-1.5 flex-shrink-0">
              {channel.mentionCount}
            </span>
          )}
          {/* Unread dot (no mentions) */}
          {channel.unread && !channel.mentionCount && !isSelected && (
            <div className="ml-2 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
          )}
        </button>

        {/* Connected Users for Voice Channels */}
        {isVoice && channel.connectedUsers && channel.connectedUsers.length > 0 && (
          <div className="ml-12 mt-1 space-y-1 animate-fade-in pb-2">
            {channel.connectedUsers.map(user => (
              <div key={user.id} className="flex items-center group/user cursor-pointer p-1.5 rounded-full hover:bg-on-surface/[0.08] w-fit pr-4">
                <img src={user.avatar} alt={user.username} className="w-6 h-6 rounded-full flex-shrink-0" />
                <span className="text-label-medium text-on-surface-variant group-hover/user:text-on-surface truncate ml-2">
                  {user.username}
                </span>
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
          className="fixed inset-0 bg-black/40 z-30 md:hidden animate-fade-in backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 w-[280px] z-40 bg-surface-container-low flex flex-col rounded-r-[28px] shadow-elevation-1
        transform transition-transform duration-300 ease-emphasized
        md:relative md:transform-none md:flex
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Server Header */}
        <div
          className="h-16 px-6 flex items-center justify-between cursor-pointer hover:bg-on-surface/[0.04] transition-colors flex-shrink-0 relative"
          onClick={() => setShowServerMenu(!showServerMenu)}
          role="button"
        >
          <h1 className="text-title-medium font-bold truncate text-on-surface">
            {server.name}
          </h1>
          <span className={`material-symbols-outlined text-on-surface-variant text-[24px] transition-transform duration-200 ${showServerMenu ? 'rotate-180' : ''}`}>
            expand_more
          </span>

          {/* Server dropdown menu */}
          {showServerMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowServerMenu(false); }} />
              <div className="absolute top-[56px] left-4 right-4 mt-1 bg-surface-container-highest rounded-[16px] shadow-elevation-3 py-2 z-50 animate-scale-in border border-outline-variant/10">
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
                    className="w-[calc(100%-16px)] mx-2 flex items-center h-12 px-3 rounded-[8px] text-body-medium text-on-surface hover:bg-primary-container hover:text-on-primary-container transition-colors"
                    onClick={(e) => { e.stopPropagation(); setShowServerMenu(false); }}
                  >
                    <span className="material-symbols-outlined text-[20px] mr-3">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
                <div className="m3-divider my-1" />
                <button className="w-[calc(100%-16px)] mx-2 flex items-center h-12 px-3 rounded-[8px] text-body-medium text-error hover:bg-error/10 transition-colors">
                  <span className="material-symbols-outlined text-[20px] mr-3 text-error">logout</span>
                  Leave Server
                </button>
              </div>
            </>
          )}
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto py-2 space-y-4 thin-scrollbar">
          {server.categories.map(category => (
            <div key={category.id}>
              {/* Category Header */}
              <div
                className="px-6 flex items-center justify-between cursor-pointer text-on-surface-variant hover:text-on-surface mb-1 group/cat py-1"
                onClick={() => toggleCategory(category.id)}
                role="button"
              >
                <div className="flex items-center text-label-small font-bold uppercase tracking-widest">
                  <span
                    className="material-symbols-outlined text-[14px] mr-1.5 transition-transform duration-200"
                    style={{ transform: isCollapsed(category.id) ? 'rotate(-90deg)' : 'rotate(0deg)' }}
                  >
                    expand_more
                  </span>
                  {category.name}
                </div>
                <button
                  className="opacity-0 group-hover/cat:opacity-100 transition-opacity p-1 hover:bg-on-surface/[0.08] rounded-full"
                  onClick={(e) => { e.stopPropagation(); }}
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
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
        <div className="bg-surface-container-high mx-3 mb-3 p-2 rounded-[20px] flex items-center justify-between flex-shrink-0 shadow-elevation-1">
          <div className="flex items-center p-1 rounded-full hover:bg-on-surface/[0.08] cursor-pointer group/user mr-auto max-w-[65%]">
            <div className="relative flex-shrink-0">
              <img src={CURRENT_USER.avatar} alt="Me" className="w-9 h-9 rounded-full border border-outline-variant/20" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-container-high" />
            </div>
            <div className="ml-2.5 overflow-hidden">
              <div className="text-label-medium font-bold truncate text-on-surface leading-tight">{CURRENT_USER.username}</div>
              <div className="text-[10px] text-on-surface-variant truncate leading-tight">Online</div>
            </div>
          </div>

          <div className="flex items-center">
            <button
              onClick={onOpenSettings}
              className="w-10 h-10 rounded-full text-on-surface-variant hover:bg-on-surface/[0.08] hover:text-on-surface transition-all flex items-center justify-center"
              aria-label="User Settings"
            >
              <span className="material-symbols-outlined text-[22px]">settings</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
