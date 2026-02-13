import React from 'react';
import { SERVERS } from '../../data/mock';

interface ServerGridProps {
  onServerSelect: (serverId: string) => void;
  onAddServer: () => void;
}

export const ServerGrid: React.FC<ServerGridProps> = ({ onServerSelect, onAddServer }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 bg-background safe-area-top">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-title-large font-bold text-on-surface">Servers</h2>
        <button
          onClick={onAddServer}
          className="p-2 rounded-full bg-primary text-on-primary shadow-elevation-2 hover:shadow-elevation-3 transition-all active:scale-95"
          aria-label="Add Server"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {SERVERS.map(server => (
          <button
            key={server.id}
            onClick={() => onServerSelect(server.id)}
            className="flex flex-col items-center space-y-2 group"
            aria-label={`${server.name}${server.mentionCount ? ` - ${server.mentionCount} mentions` : ''}`}
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-[20px] overflow-hidden shadow-elevation-1 group-active:scale-95 transition-transform group-hover:rounded-[16px]">
                <img src={server.icon} alt={server.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              {/* Mention badge */}
              {server.mentionCount && server.mentionCount > 0 && (
                <div className="absolute -top-1 -right-1 min-w-[20px] h-[20px] bg-error text-on-error text-[11px] font-bold rounded-full flex items-center justify-center px-1 shadow-elevation-1">
                  {server.mentionCount}
                </div>
              )}
              {/* Unread dot */}
              {server.unread && !server.mentionCount && (
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full shadow-elevation-1" />
              )}
            </div>
            <span className="text-label-medium text-center truncate w-full text-on-surface leading-tight">
              {server.name}
            </span>
          </button>
        ))}

        {/* Add Server Tile */}
        <button
          onClick={onAddServer}
          className="flex flex-col items-center space-y-2 group"
          aria-label="Add Server"
        >
          <div className="w-16 h-16 rounded-[20px] bg-surface-container-high flex items-center justify-center border-2 border-dashed border-outline-variant/50 text-primary shadow-elevation-1 group-active:scale-95 transition-all group-hover:border-primary group-hover:bg-primary/10">
            <span className="material-symbols-outlined text-[28px]">add</span>
          </div>
          <span className="text-label-medium text-center truncate w-full text-on-surface-variant">
            Add Server
          </span>
        </button>
      </div>
    </div>
  );
};
