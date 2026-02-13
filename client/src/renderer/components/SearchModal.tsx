import { useState } from 'react';
import { api } from '../services/api';

export function SearchModal({ guildId, onClose }: { guildId: string, onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setGifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await api.get(`/guilds/${guildId}/search?q=${query}`);
      setGifs(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface w-full max-w-2xl max-h-[85vh] rounded-[28px] shadow-elevation-5 flex flex-col overflow-hidden animate-scale-in border border-outline-variant/10">
        {/* Search Header */}
        <div className="p-4 border-b border-outline-variant/10 flex items-center gap-2">
          <div className="m3-search-bar !h-12 !shadow-none !bg-surface-container-high flex-1">
            <span className="material-symbols-outlined text-primary">search</span>
            <form onSubmit={handleSearch} className="flex-1">
              <input 
                autoFocus
                type="text" 
                placeholder="Search for messages..."
                className="w-full bg-transparent border-none outline-none text-on-surface text-body-large placeholder:text-on-surface-variant/60"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </form>
            {query && (
              <button onClick={() => setQuery('')} className="m3-icon-button !w-8 !h-8">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
          <button onClick={onClose} className="m3-icon-button">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 thin-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-60">
              <div className="spinner" />
              <p className="text-body-medium">Searching messages...</p>
            </div>
          ) : results.length > 0 ? (
            results.map(msg => (
              <div key={msg.id} className="m3-card !p-4 hover:shadow-elevation-2 cursor-pointer group border border-outline-variant/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-label-large font-bold text-primary">{msg.display_name}</span>
                    <span className="text-[10px] text-on-surface-variant font-medium bg-surface-container-highest px-2 py-0.5 rounded-full">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant text-[18px]">
                    chevron_right
                  </span>
                </div>
                <p className="text-on-surface text-body-medium leading-relaxed line-clamp-3 italic">
                  "{msg.content}"
                </p>
              </div>
            ))
          ) : query && !loading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-40">
              <span className="material-symbols-outlined text-[64px] mb-4">search_off</span>
              <p className="text-body-large">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20 opacity-30">
              <span className="material-symbols-outlined text-[80px] mb-4">manage_search</span>
              <p className="text-title-medium font-bold uppercase tracking-widest">Global Search</p>
              <p className="text-body-small mt-1 text-center max-w-[240px]">
                Search history, users, and media across the entire server.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
