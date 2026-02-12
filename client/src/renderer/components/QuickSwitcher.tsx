import { useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { Hash, Shield } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-background-secondary w-full max-w-lg rounded-lg shadow-2xl flex flex-col overflow-hidden border border-background-tertiary">
        <div className="p-4">
          <input 
            autoFocus
            type="text" 
            placeholder="Where would you like to go?"
            className="w-full bg-background-tertiary rounded p-3 text-header-primary outline-none focus:ring-1 focus:ring-nautilus"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        
        <div className="flex-1 overflow-y-auto pb-4">
          {filtered.map((item) => (
            <div 
              key={`${item.type}-${item.id}`}
              onClick={() => handleSelect(item)}
              className="px-4 py-2 hover:bg-nautilus hover:text-white text-header-secondary flex items-center space-x-3 cursor-pointer group"
            >
              {item.type === 'guild' ? (
                <Shield size={18} className="opacity-60 group-hover:opacity-100" />
              ) : (
                <Hash size={18} className="opacity-60 group-hover:opacity-100" />
              )}
              <div className="flex-1">
                <div className="text-header-primary group-hover:text-white font-medium">{item.name}</div>
                {item.type === 'channel' && <div className="text-[10px] opacity-60">in {guilds.find(g => g.id === item.guildId)?.name}</div>}
              </div>
              <div className="text-[10px] uppercase font-bold opacity-0 group-hover:opacity-100">Jump</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
