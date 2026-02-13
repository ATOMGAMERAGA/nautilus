import React from 'react';
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
      className="w-20 h-full bg-surface flex flex-col items-center py-4 space-y-4 overflow-y-auto no-scrollbar z-20 flex-shrink-0 border-r border-outline-variant/10"
      role="navigation"
      aria-label="Server navigation"
    >
      <div
        className="relative group w-full flex flex-col items-center cursor-pointer"
        onClick={(e) => { onHomeSelect(); createRipple(e); }}
        role="button"
      >
        <div className="relative w-14 h-8 flex items-center justify-center">
          <div className={`absolute inset-0 bg-secondary-container rounded-full transition-all duration-300 ease-emphasized ${
            isHomeSelected ? 'scale-100 opacity-100' : 'scale-[0.4] opacity-0 group-hover:opacity-40 group-hover:scale-100'
          }`} />
          <img
            src="/icon.png"
            alt="Home"
            className={`w-6 h-6 object-contain relative z-10 transition-all duration-200 ${
              isHomeSelected ? 'brightness-100' : 'brightness-75 group-hover:brightness-100'
            }`}
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
              img.parentElement!.innerHTML = '<span class="material-symbols-outlined text-[24px] relative z-10">home</span>';
            }}
          />
        </div>
        <span className={`text-[11px] font-bold mt-1 transition-colors duration-200 ${
          isHomeSelected ? 'text-on-surface' : 'text-on-surface-variant'
        }`}>Home</span>
      </div>

      <div className="m3-divider !w-8 mx-auto" />

      <div className="flex flex-col items-center space-y-4 w-full">
        {SERVERS.map((server) => {
          const isSelected = selectedServerId === server.id && !isHomeSelected;
          return (
            <div
              key={server.id}
              className="relative group w-full flex flex-col items-center cursor-pointer"
              onClick={(e) => { onServerSelect(server.id); createRipple(e); }}
              role="button"
            >
              <div className="relative w-14 h-8 flex items-center justify-center">
                <div className={`absolute inset-0 bg-secondary-container rounded-full transition-all duration-300 ease-emphasized ${
                  isSelected ? 'scale-100 opacity-100' : 'scale-[0.4] opacity-0 group-hover:opacity-40 group-hover:scale-100'
                }`} />
                <div className="w-7 h-7 rounded-full overflow-hidden relative z-10 border border-outline-variant/20 shadow-sm">
                  <img src={server.icon} alt={server.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                {server.unread && !server.mentionCount && !isSelected && (
                  <div className="absolute top-0 right-3 w-2 h-2 bg-primary rounded-full z-20 border border-surface shadow-sm" />
                )}
                {server.mentionCount && server.mentionCount > 0 && (
                  <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-elevation-1 z-30 border border-surface">
                    {server.mentionCount > 9 ? '9+' : server.mentionCount}
                  </div>
                )}
              </div>
              <span className={`text-[10px] font-bold mt-1 truncate max-w-[64px] transition-colors duration-200 ${
                isSelected ? 'text-on-surface' : 'text-on-surface-variant'
              }`}>
                {server.name}
              </span>
            </div>
          );
        })}
      </div>

      <div className="m3-divider !w-8 mx-auto" />

      <div
        className="relative group w-full flex flex-col items-center cursor-pointer"
        onClick={(e) => { onAddServer(); createRipple(e); }}
        role="button"
      >
        <div className="w-12 h-12 flex items-center justify-center transition-all duration-200 rounded-[16px] bg-surface-container-high group-hover:bg-primary-container text-primary group-hover:text-on-primary-container shadow-sm">
          <span className="material-symbols-outlined text-[24px]">add</span>
        </div>
        <span className="text-[10px] font-medium mt-1 text-on-surface-variant group-hover:text-on-surface">Create</span>
      </div>
    </nav>
  );
};