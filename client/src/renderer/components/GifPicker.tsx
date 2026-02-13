import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Gif {
  id: string;
  url: string;
  preview: string;
}

export function GifPicker({ onSelect }: { onSelect: (url: string) => void }) {
  const [search, setSearch] = useState('');
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      try {
        const res = await api.get('/gifs/search?q=trending');
        setGifs(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (e.target.value.length < 2) return;
    
    setLoading(true);
    try {
      const res = await api.get(`/gifs/search?q=${e.target.value}`);
      setGifs(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[360px] h-[480px] max-w-[90vw] bg-surface-container-highest rounded-[28px] shadow-elevation-3 flex flex-col border border-outline-variant/10 overflow-hidden animate-scale-in">
      <div className="p-4 bg-surface-container-high border-b border-outline-variant/10">
        <div className="m3-search-bar !h-11 !shadow-none !bg-surface-container-lowest">
          <span className="material-symbols-outlined text-primary text-[20px]">search</span>
          <input 
            type="text"
            placeholder="Search Tenor"
            className="flex-1 bg-transparent border-none outline-none text-body-medium text-on-surface placeholder:text-on-surface-variant/50"
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2 thin-scrollbar">
        {loading ? (
          <div className="col-span-2 flex flex-col items-center justify-center py-20 gap-3 opacity-60">
            <div className="spinner" />
            <p className="text-label-medium">Fetching GIFs...</p>
          </div>
        ) : gifs.length > 0 ? (
          gifs.map(gif => (
            <img 
              key={gif.id} 
              src={gif.preview} 
              className="w-full h-32 object-cover rounded-[12px] cursor-pointer hover:shadow-elevation-1 active:scale-95 transition-all"
              onClick={() => onSelect(gif.url)}
              loading="lazy"
            />
          ))
        ) : (
          <div className="col-span-2 flex flex-col items-center justify-center py-20 opacity-40">
            <span className="material-symbols-outlined text-[48px] mb-2">sentiment_dissatisfied</span>
            <p className="text-body-medium">No GIFs found</p>
          </div>
        )}
      </div>
      <div className="p-2 flex justify-center bg-surface-container-low border-t border-outline-variant/10 shrink-0">
        <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">Powered by Tenor</span>
      </div>
    </div>
  );
}
