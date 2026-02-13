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
  return (
    <nav className="w-[72px] h-full bg-surface-container-low flex flex-col items-center py-3 space-y-2 overflow-y-auto no-scrollbar z-20 shadow-elevation-1">
      {/* Home / DM Button */}
      <div className="relative group w-12 h-12 flex items-center justify-center cursor-pointer" onClick={onHomeSelect}>
        {isHomeSelected && (
          <div className="absolute left-0 w-1 h-10 bg-primary rounded-r-full transition-all duration-200" />
        )}
        {!isHomeSelected && (
          <div className="absolute left-0 w-1 h-2 bg-on-surface opacity-0 group-hover:opacity-100 group-hover:h-5 transition-all duration-200 rounded-r-full" />
        )}
        <div className={`w-12 h-12 flex items-center justify-center transition-all duration-200 overflow-hidden ${isHomeSelected ? 'rounded-[16px] bg-primary' : 'rounded-[24px] group-hover:rounded-[16px] bg-surface-container-high group-hover:bg-primary'}`}>
           <img src="icon.png" alt="Home" className="w-8 h-8 object-contain" onError={(e) => {
             // Fallback if icon.png is missing or broken path
             (e.target as HTMLImageElement).src = 'https://placehold.co/48x48/1B5FA8/FFFFFF?text=N';
           }} />
        </div>
      </div>

      <div className="w-8 h-[2px] bg-outline-variant rounded-full mx-auto my-2 opacity-50" />

      {/* Server List */}
      {SERVERS.map((server) => {
        const isSelected = selectedServerId === server.id;
        return (
          <div key={server.id} className="relative group w-12 h-12 flex items-center justify-center cursor-pointer" onClick={() => onServerSelect(server.id)}>
            {/* Selection Pill */}
            {isSelected && (
              <div className="absolute left-0 w-1 h-10 bg-primary rounded-r-full transition-all duration-200 animate-[scaleY_0.2s_ease-emphasized]" />
            )}
            {/* Hover Pill */}
            {!isSelected && (
              <div className="absolute left-0 w-1 h-2 bg-on-surface opacity-0 group-hover:opacity-100 group-hover:h-5 transition-all duration-200 rounded-r-full" />
            )}
            
            {/* Icon */}
            <div className={`w-12 h-12 transition-all duration-200 overflow-hidden flex items-center justify-center
              ${isSelected ? 'rounded-[16px]' : 'rounded-[24px] group-hover:rounded-[16px]'}
            `}>
              <img src={server.icon} alt={server.name} className="w-full h-full object-cover" />
            </div>

            {/* Tooltip (Desktop only usually, but good to have structure) */}
            <div className="absolute left-full ml-4 px-3 py-2 bg-on-surface text-surface-container-lowest text-sm font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 shadow-elevation-2 hidden md:block">
              {server.name}
              {/* Tooltip Arrow */}
              <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-1 border-4 border-transparent border-r-on-surface" />
            </div>
          </div>
        );
      })}

      {/* Add Server Button */}
      <div 
        className="relative group w-12 h-12 flex items-center justify-center cursor-pointer mt-2"
        onClick={onAddServer}
      >
        <div className="w-12 h-12 flex items-center justify-center transition-all duration-200 rounded-[24px] group-hover:rounded-[16px] bg-surface-container group-hover:bg-primary-container text-primary group-hover:text-on-primary-container border border-dashed border-outline hover:border-solid hover:border-transparent">
          <span className="material-symbols-outlined">add</span>
        </div>
      </div>
    </nav>
  );
};
