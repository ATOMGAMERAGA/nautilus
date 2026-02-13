import React, { useState } from 'react';
import { USERS } from '../../data/mock';
import type { Server, Channel } from '../../data/mock';

interface ChannelSidebarProps {
  server: Server;
  selectedChannelId?: string;
  onChannelSelect: (channelId: string) => void;
  mobileOpen?: boolean; // Controlled by parent for mobile drawer
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

  const toggleCategory = (catId: string) => {
    const newSet = new Set(collapsedCategories);
    if (newSet.has(catId)) {
      newSet.delete(catId);
    } else {
      newSet.add(catId);
    }
    setCollapsedCategories(newSet);
  };

  const isCollapsed = (catId: string) => collapsedCategories.has(catId);

  // Helper to render channel list item
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
          className={`w-full flex items-center px-2 py-1.5 mx-2 rounded-md transition-colors duration-200 group
            ${isSelected 
              ? 'bg-secondary-container text-on-secondary-container' 
              : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }
          `}
          style={{ width: 'calc(100% - 16px)' }}
        >
          <span className="material-symbols-outlined text-[20px] mr-1.5 opacity-70">
            {isVoice ? 'volume_up' : 'tag'}
          </span>
          <span className={`text-body-large truncate font-medium ${channel.unread ? 'font-bold text-on-surface' : ''}`}>
            {channel.name}
          </span>
          {channel.unread && (
             <div className="ml-auto w-2 h-2 rounded-full bg-on-surface" />
          )}
        </button>
        
        {/* Connected Users for Voice Channels */}
        {isVoice && channel.connectedUsers && channel.connectedUsers.length > 0 && (
          <div className="ml-9 mt-1 space-y-1">
            {channel.connectedUsers.map(user => (
              <div key={user.id} className="flex items-center group cursor-pointer p-1 rounded hover:bg-surface-container-highest w-fit pr-2">
                <img src={user.avatar} alt={user.username} className="w-6 h-6 rounded-full mr-2" />
                <span className="text-label-medium text-on-surface-variant group-hover:text-on-surface truncate max-w-[120px]">
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
          className="fixed inset-0 bg-black/50 z-30 md:hidden animate-fade-in"
          onClick={onCloseMobile}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 w-[85%] max-w-[300px] z-40 bg-surface-container
        transform transition-transform duration-300 ease-emphasized
        md:relative md:transform-none md:w-60 md:flex md:flex-col
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-outline-variant/20 shadow-sm cursor-pointer hover:bg-surface-container-high transition-colors">
          <h1 className="text-title-medium font-bold truncate text-on-surface">
            {server.name}
          </h1>
          <span className="material-symbols-outlined text-on-surface-variant">expand_more</span>
        </div>

        {/* Server Banner (Optional) */}
        {server.banner && (
           <div className="h-32 w-full bg-cover bg-center relative" style={{ backgroundImage: `url(${server.banner})` }}>
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-container opacity-90" />
           </div>
        )}

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 no-scrollbar">
          {server.categories.map(category => (
            <div key={category.id}>
              {/* Category Header */}
              <div 
                className="px-4 flex items-center justify-between cursor-pointer text-on-surface-variant hover:text-on-surface mb-1 group"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center text-label-large font-bold uppercase tracking-wider text-xs">
                  <span className="material-symbols-outlined text-[12px] mr-1 transition-transform duration-200" style={{ transform: isCollapsed(category.id) ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                    expand_more
                  </span>
                  {category.name}
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>

              {/* Channels */}
              <div className={`transition-all duration-300 ease-standard origin-top ${isCollapsed(category.id) ? 'h-0 overflow-hidden opacity-0' : 'h-auto opacity-100'}`}>
                {category.channels.map(renderChannel)}
              </div>
            </div>
          ))}
        </div>

        {/* User Bar */}
        <div className="h-[52px] bg-surface-container-high px-2 flex items-center justify-between shrink-0">
          <div className="flex items-center p-1 rounded-md hover:bg-surface-container-highest cursor-pointer group mr-auto">
            <div className="relative">
              <img src={USERS[0].avatar} alt="Me" className="w-8 h-8 rounded-full" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-surface-container-high" />
            </div>
            <div className="ml-2 text-sm overflow-hidden">
               <div className="text-on-surface font-medium truncate max-w-[80px]">{USERS[0].username}</div>
               <div className="text-on-surface-variant text-xs truncate max-w-[80px]">#{USERS[0].discriminator}</div>
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
               onClick={onOpenSettings}
               className="p-1.5 rounded-full hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
             >
               <span className="material-symbols-outlined text-[20px]">settings</span>
             </button>
          </div>
        </div>
      </div>
    </>
  );
};
