import { useState } from 'react';
import { api } from '../services/api';
import { Search, X } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-background-primary w-full max-w-2xl max-h-[80vh] rounded-lg shadow-2xl flex flex-col overflow-hidden border border-background-tertiary">
        <div className="p-4 border-b border-background-tertiary flex items-center space-x-4">
          <Search className="text-header-secondary" />
          <form onSubmit={handleSearch} className="flex-1">
            <input 
              autoFocus
              type="text" 
              placeholder="Search for messages..."
              className="w-full bg-transparent border-none outline-none text-header-primary text-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
          <button onClick={onClose} className="text-header-secondary hover:text-header-primary">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="text-center py-10 text-header-secondary">Searching...</div>
          ) : results.length > 0 ? (
            results.map(msg => (
              <div key={msg.id} className="p-3 bg-background-secondary rounded hover:bg-background-tertiary transition-colors cursor-pointer group">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-bold text-header-primary text-sm">{msg.display_name}</span>
                  <span className="text-[10px] text-header-secondary">{new Date(msg.created_at).toLocaleString()}</span>
                </div>
                <div className="text-header-primary text-sm line-clamp-3">{msg.content}</div>
              </div>
            ))
          ) : query && (
            <div className="text-center py-10 text-header-secondary">No results found for "{query}"</div>
          )}
        </div>
      </div>
    </div>
  );
}
