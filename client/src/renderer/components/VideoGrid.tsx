import { useEffect, useRef } from 'react';

interface VideoStream {
  userId: string;
  stream: MediaStream;
  displayName: string;
  isLocal?: boolean;
}

export function VideoGrid({ streams }: { streams: VideoStream[] }) {
  return (
    <div className="flex-1 bg-surface-container-lowest p-4 overflow-y-auto thin-scrollbar">
      <div className={`grid gap-4 h-full min-h-[400px] ${
        streams.length === 1 ? 'grid-cols-1' : 
        streams.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : 
        streams.length <= 4 ? 'grid-cols-2' : 
        'grid-cols-2 lg:grid-cols-3'
      }`}>
        {streams.map((s) => (
          <VideoTile key={s.userId} stream={s} />
        ))}
      </div>
    </div>
  );
}

function VideoTile({ stream }: { stream: VideoStream }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream.stream;
    }
  }, [stream]);

  return (
    <div className="relative bg-surface-container-highest rounded-[24px] overflow-hidden aspect-video flex items-center justify-center group shadow-elevation-1 border border-outline-variant/10">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted={stream.isLocal}
        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
      />
      <div className="absolute bottom-3 left-3 bg-surface-container-lowest/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10 shadow-elevation-2 transition-all group-hover:bottom-4">
        <span className={`w-2 h-2 rounded-full ${stream.isLocal ? 'bg-primary' : 'bg-green-500'} animate-pulse`} />
        <span className="text-on-surface text-[11px] font-black uppercase tracking-widest">
          {stream.displayName} {stream.isLocal && '(Local)'}
        </span>
      </div>
      
      {/* Overlay controls on hover */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
         <button className="w-10 h-10 rounded-full bg-surface-container-highest/90 text-on-surface flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all">
           <span className="material-symbols-outlined">more_vert</span>
         </button>
      </div>
    </div>
  );
}
