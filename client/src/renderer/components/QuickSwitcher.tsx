import { useState } from 'react';
import { useChatStore } from '../store/chatStore';

export function QuickSwitcher({ onClose }: { onClose: () => void }) {
  const { guilds, selectGuild, selectChannel } = useChatStore();
  const [query, setQuery] = useState('');

  const allItems = guilds.flatMap(g => [
    { type: 'guild', id: g.id, name: g.name, guildId: g.id },
    ...g.channels.map(c => ({ type: 'channel', id: c.id, name: c.name, guildId: g.id, channel: c }))
  ]);

  const filtered = allItems.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10);

  const handleSelect = (item: any) => {
    if (item.type === 'guild') {
      selectGuild(item.id);
    } else {
      selectGuild(item.guildId);
      selectChannel(item.channel);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface w-full max-w-lg rounded-[28px] shadow-elevation-5 flex flex-col overflow-hidden animate-scale-in border border-outline-variant/10">
        <div className="p-6 pb-2">
          <div className="m3-search-bar !h-14 !bg-surface-container-high !shadow-none ring-1 ring-outline-variant/20 focus-within:ring-2 focus-within:ring-primary">
            <span className="material-symbols-outlined text-primary text-[24px]">explore</span>
            <input 
              autoFocus
              type="text" 
              placeholder="Where would you like to go?"
              className="flex-1 bg-transparent border-none outline-none text-on-surface text-body-large placeholder:text-on-surface-variant/50"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pb-6 px-3 space-y-1 thin-scrollbar max-h-[400px]">
          <div className="px-4 py-3">
            <span className="text-label-small font-bold text-primary uppercase tracking-widest">Suggestions</span>
          </div>
          {filtered.map((item) => (
            <button 
              key={`${item.type}-${item.id}`}
              onClick={() => handleSelect(item)}
              className="w-full m3-navigation-drawer-item group !mx-0 hover:bg-primary/[0.08] text-left"
            >
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
                {item.type === 'guild' ? 'dns' : 'tag'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-label-large font-bold text-on-surface truncate">{item.name}</div>
                {item.type === 'channel' && (
                  <div className="text-[10px] text-on-surface-variant uppercase tracking-tight opacity-70">
                    in {guilds.find(g => g.id === item.guildId)?.name}
                  </div>
                )}
              </div>
              <div className="text-[10px] uppercase font-black text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                Jump
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center opacity-40">
              <span className="material-symbols-outlined text-[48px] mb-2">search_off</span>
              <p className="text-label-large">No results found</p>
            </div>
          )}
        </div>
        <div className="p-3 bg-surface-container-highest flex justify-center border-t border-outline-variant/10 shrink-0">
           <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest">
             <span className="bg-surface-container rounded px-1.5 py-0.5 border border-outline-variant/20 mr-1 text-on-surface">ESC</span> to close
           </p>
        </div>
      </div>
    </div>
  );
}
