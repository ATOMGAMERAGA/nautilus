import React from 'react';
import { SERVERS } from '../../data/mock';

interface ServerGridProps {
  onServerSelect: (serverId: string) => void;
  onAddServer: () => void;
}

export const ServerGrid: React.FC<ServerGridProps> = ({ onServerSelect, onAddServer }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 bg-background">
      <h2 className="text-title-large font-bold mb-4 text-on-surface">Servers</h2>
      <div className="grid grid-cols-3 gap-4">
        {SERVERS.map(server => (
          <button 
            key={server.id}
            onClick={() => onServerSelect(server.id)}
            className="flex flex-col items-center space-y-2 group"
          >
            <div className="w-16 h-16 rounded-[24px] overflow-hidden shadow-elevation-1 group-active:scale-95 transition-transform">
              <img src={server.icon} alt={server.name} className="w-full h-full object-cover" />
            </div>
            <span className="text-label-medium text-center truncate w-full text-on-surface">
              {server.name}
            </span>
          </button>
        ))}
        
        {/* Add Server Button */}
        <button 
          onClick={onAddServer}
          className="flex flex-col items-center space-y-2 group"
        >
          <div className="w-16 h-16 rounded-[24px] bg-surface-container-high flex items-center justify-center border border-dashed border-outline text-primary shadow-elevation-1 group-active:scale-95 transition-transform">
             <span className="material-symbols-outlined text-[32px]">add</span>
          </div>
          <span className="text-label-medium text-center truncate w-full text-on-surface-variant">
            Add Server
          </span>
        </button>
      </div>
    </div>
  );
};
