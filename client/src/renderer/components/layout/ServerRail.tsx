import React, { useState } from 'react';
import { SERVERS } from '../../data/mock';

interface ServerRailProps {
  selectedServerId?: string;
  onServerSelect: (serverId: string) => void;
  onHomeSelect: () => void;
  isHomeSelected?: boolean;
  onAddServer: () => void;
}

export const ServerRail: React.FC<ServerRailProps> = ({
  selectedServerId,
  onServerSelect,
  onHomeSelect,
  isHomeSelected,
  onAddServer
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, serverId: string) => {
    setDraggedId(serverId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const createRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    ripple.className = 'ripple';
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  return (
    <nav
      className="w-[72px] h-full bg-surface-container-lowest flex flex-col items-center py-3 space-y-2 overflow-y-auto no-scrollbar z-20 flex-shrink-0"
      role="navigation"
      aria-label="Server navigation"
    >
      {/* Home / DM Button */}
      <div
        className="relative group w-12 h-12 flex items-center justify-center cursor-pointer mb-0.5"
        onClick={(e) => { onHomeSelect(); createRipple(e); }}
        role="button"
        aria-label="Home - Direct Messages"
        tabIndex={0}
      >
        {/* Selection pill */}
        <div className={`absolute left-0 w-1 rounded-r-full bg-primary transition-all duration-200 ease-emphasized ${
          isHomeSelected ? 'h-10' : 'h-0 group-hover:h-5'
        }`} />

        <div className={`w-12 h-12 flex items-center justify-center transition-all duration-200 overflow-hidden ripple-container ${
          isHomeSelected
            ? 'rounded-[16px] bg-primary'
            : 'rounded-[24px] group-hover:rounded-[16px] bg-surface-container-high group-hover:bg-primary'
        }`}>
          <img
            src="/icon.png"
            alt="Home"
            className={`w-7 h-7 object-contain transition-all ${isHomeSelected ? 'brightness-200' : 'group-hover:brightness-200'}`}
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
              img.parentElement!.innerHTML = '<span class="material-symbols-outlined text-[28px]">sailing</span>';
            }}
          />
        </div>

        {/* Tooltip */}
        <div className="absolute left-full ml-4 px-3 py-1.5 bg-surface-container-highest text-on-surface text-body-small font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50 shadow-elevation-3 hidden md:block">
          Direct Messages
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-surface-container-highest" />
        </div>
      </div>

      {/* Separator */}
      <div className="w-8 h-[2px] bg-outline-variant/30 rounded-full mx-auto" />

      {/* Server List */}
      {SERVERS.map((server) => {
        const isSelected = selectedServerId === server.id;
        const isDragging = draggedId === server.id;

        return (
          <div
            key={server.id}
            className={`relative group w-12 h-12 flex items-center justify-center cursor-pointer transition-opacity ${isDragging ? 'opacity-50' : ''}`}
            onClick={(e) => { onServerSelect(server.id); createRipple(e); }}
            draggable
            onDragStart={(e) => handleDragStart(e, server.id)}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            role="button"
            aria-label={`${server.name}${server.mentionCount ? ` - ${server.mentionCount} mentions` : server.unread ? ' - unread messages' : ''}`}
            tabIndex={0}
          >
            {/* Selection Pill */}
            <div className={`absolute left-0 w-1 rounded-r-full transition-all duration-200 ease-emphasized ${
              isSelected ? 'h-10 bg-primary' : 'h-0 group-hover:h-5 bg-on-surface'
            }`} />

            {/* Server Icon */}
            <div className={`w-12 h-12 transition-all duration-200 overflow-hidden flex items-center justify-center ripple-container ${
              isSelected ? 'rounded-[16px]' : 'rounded-[24px] group-hover:rounded-[16px]'
            }`}>
              <img
                src={server.icon}
                alt={server.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Unread dot indicator (no mentions) */}
            {server.unread && !server.mentionCount && !isSelected && (
              <div className="absolute left-0 w-2 h-2 bg-on-surface rounded-full" />
            )}

            {/* Mention Badge */}
            {server.mentionCount && server.mentionCount > 0 && (
              <div className="absolute bottom-[-2px] right-[-2px] min-w-[18px] h-[18px] bg-error text-on-error text-[11px] font-bold rounded-full flex items-center justify-center px-1 shadow-elevation-1 animate-badge-bounce">
                {server.mentionCount > 99 ? '99+' : server.mentionCount}
              </div>
            )}

            {/* Tooltip */}
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-surface-container-highest text-on-surface text-body-small font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50 shadow-elevation-3 hidden md:block">
              {server.name}
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-surface-container-highest" />
            </div>
          </div>
        );
      })}

      {/* Separator */}
      <div className="w-8 h-[2px] bg-outline-variant/30 rounded-full mx-auto" />

      {/* Add Server Button */}
      <div
        className="relative group w-12 h-12 flex items-center justify-center cursor-pointer"
        onClick={(e) => { onAddServer(); createRipple(e); }}
        role="button"
        aria-label="Add a Server"
        tabIndex={0}
      >
        <div className="w-12 h-12 flex items-center justify-center transition-all duration-200 rounded-[24px] group-hover:rounded-[16px] bg-surface-container group-hover:bg-primary/20 text-primary border border-dashed border-outline-variant/50 group-hover:border-primary/50 ripple-container">
          <span className="material-symbols-outlined text-[24px]">add</span>
        </div>

        {/* Tooltip */}
        <div className="absolute left-full ml-4 px-3 py-1.5 bg-surface-container-highest text-on-surface text-body-small font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50 shadow-elevation-3 hidden md:block">
          Add a Server
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-surface-container-highest" />
        </div>
      </div>

      {/* Discover Servers Button */}
      <div
        className="relative group w-12 h-12 flex items-center justify-center cursor-pointer"
        role="button"
        aria-label="Explore Servers"
        tabIndex={0}
      >
        <div className="w-12 h-12 flex items-center justify-center transition-all duration-200 rounded-[24px] group-hover:rounded-[16px] bg-surface-container group-hover:bg-primary/20 text-primary ripple-container">
          <span className="material-symbols-outlined text-[24px]">explore</span>
        </div>

        <div className="absolute left-full ml-4 px-3 py-1.5 bg-surface-container-highest text-on-surface text-body-small font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50 shadow-elevation-3 hidden md:block">
          Explore Servers
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-surface-container-highest" />
        </div>
      </div>
    </nav>
  );
};
