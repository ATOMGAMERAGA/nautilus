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
    <div className="w-[400px] h-[400px] bg-background-secondary rounded-lg shadow-2xl flex flex-col border border-background-tertiary overflow-hidden">
      <div className="p-4 bg-background-tertiary">
        <input 
          type="text"
          placeholder="Search Tenor"
          className="w-full bg-background-primary rounded p-2 text-sm text-header-primary outline-none focus:ring-1 focus:ring-nautilus"
          value={search}
          onChange={handleSearch}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2 grid grid-cols-2 gap-2">
        {loading ? (
          <div className="col-span-2 text-center py-10 text-header-secondary">Searching...</div>
        ) : (
          gifs.map(gif => (
            <img 
              key={gif.id} 
              src={gif.preview} 
              className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onSelect(gif.url)}
            />
          ))
        )}
      </div>
    </div>
  );
}
