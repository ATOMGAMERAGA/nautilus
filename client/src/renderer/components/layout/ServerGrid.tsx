import React from 'react';
import { SERVERS } from '../../data/mock';

interface ServerGridProps {
  onServerSelect: (serverId: string) => void;
  onAddServer: () => void;
}

export const ServerGrid: React.FC<ServerGridProps> = ({ onServerSelect, onAddServer }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-surface safe-area-top thin-scrollbar">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-headline-small font-bold text-on-surface">Servers</h2>
          <p className="text-body-small text-on-surface-variant opacity-70">Your communities</p>
        </div>
        <button
          onClick={onAddServer}
          className="m3-fab !w-12 !h-12 !rounded-[12px]"
          aria-label="Add Server"
        >
          <span className="material-symbols-outlined text-[24px]">add</span>
        </button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVERS.map(server => (
          <button
            key={server.id}
            onClick={() => onServerSelect(server.id)}
            className="flex flex-col items-center gap-2 group transition-all"
            aria-label={`${server.name}${server.mentionCount ? ` - ${server.mentionCount} mentions` : ''}`}
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-[24px] overflow-hidden shadow-elevation-1 transition-all duration-300 group-hover:rounded-[16px] group-hover:shadow-elevation-2 group-active:scale-95 group-active:shadow-elevation-1 border border-outline-variant/10">
                <img src={server.icon} alt={server.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              {/* Mention badge (M3 style) */}
              {server.mentionCount && server.mentionCount > 0 && (
                <div className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] bg-error text-on-error text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-elevation-2 border-2 border-surface animate-badge-bounce">
                  {server.mentionCount > 9 ? '9+' : server.mentionCount}
                </div>
              )}
              {/* Unread indicator */}
              {server.unread && !server.mentionCount && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full shadow-elevation-1 border-2 border-surface" />
              )}
            </div>
            <span className="text-label-medium font-bold text-center truncate w-full text-on-surface group-hover:text-primary transition-colors">
              {server.name}
            </span>
          </button>
        ))}

        {/* Add Server Tile (M3 style) */}
        <button
          onClick={onAddServer}
          className="flex flex-col items-center gap-2 group"
          aria-label="Add Server"
        >
          <div className="w-16 h-16 rounded-[24px] bg-surface-container-high flex items-center justify-center border-2 border-dashed border-outline-variant transition-all duration-300 group-hover:border-primary group-hover:bg-primary/5 group-hover:rounded-[16px] group-active:scale-95 group-active:bg-primary/10">
            <span className="material-symbols-outlined text-[28px] text-primary">add</span>
          </div>
          <span className="text-label-medium font-bold text-center truncate w-full text-on-surface-variant group-hover:text-primary transition-colors">
            Add Server
          </span>
        </button>
      </div>
    </div>
  );
};
