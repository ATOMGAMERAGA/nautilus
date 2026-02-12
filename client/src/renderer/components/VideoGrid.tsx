import { useEffect, useRef } from 'react';

interface VideoStream {
  userId: string;
  stream: MediaStream;
  displayName: string;
  isLocal?: boolean;
}

export function VideoGrid({ streams }: { streams: VideoStream[] }) {
  return (
    <div className="flex-1 bg-black p-4 overflow-y-auto">
      <div className={`grid gap-4 h-full ${
        streams.length === 1 ? 'grid-cols-1' : 
        streams.length <= 2 ? 'grid-cols-2' : 
        streams.length <= 4 ? 'grid-cols-2 grid-rows-2' : 
        'grid-cols-3'
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
    <div className="relative bg-background-tertiary rounded-lg overflow-hidden aspect-video flex items-center justify-center group">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted={stream.isLocal}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-xs font-bold">
        {stream.displayName} {stream.isLocal && '(You)'}
      </div>
    </div>
  );
}
