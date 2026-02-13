import { useState } from 'react';
import { voiceController } from '../services/voiceController';

export function VoiceControls({ channelId }: { channelId: string }) {
  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(false);

  const handleJoin = async () => {
    await voiceController.join(channelId);
    setJoined(true);
  };

  const handleLeave = () => {
    setJoined(false);
    setVideoOn(false);
    voiceController.stopProduce('audio');
    voiceController.stopProduce('video');
  };

  const toggleMute = () => {
    setMuted(!muted);
    if (!muted) voiceController.stopProduce('audio');
  };

  const toggleVideo = async () => {
    if (videoOn) {
      await voiceController.stopProduce('video');
      setVideoOn(false);
    } else {
      const stream = await voiceController.startVideo(channelId);
      if (stream) setVideoOn(true);
    }
  };

  const shareScreen = async () => {
    await voiceController.startScreenShare(channelId);
  };

  if (!joined) {
    return (
      <button 
        onClick={handleJoin}
        className="flex items-center gap-2 text-primary hover:bg-primary/[0.08] px-3 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-widest transition-all border border-primary/20"
      >
        <span className="material-symbols-outlined text-[18px]">call</span>
        <span>Join Voice</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-surface-container-highest/50 backdrop-blur-md p-1.5 rounded-full border border-outline-variant/20 shadow-elevation-1">
      <div className="flex items-center px-3 py-1 bg-green-500/10 rounded-full gap-2">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        <span className="text-[10px] font-black text-green-500 uppercase tracking-tighter">Connected</span>
      </div>
      
      <div className="flex items-center gap-1">
        <button 
          onClick={toggleMute} 
          title="Toggle Mic" 
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
            muted ? 'bg-error-container text-on-error-container' : 'hover:bg-on-surface/[0.08] text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {muted ? 'mic_off' : 'mic'}
          </span>
        </button>
        
        <button 
          onClick={toggleVideo} 
          title="Toggle Video" 
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
            videoOn ? 'bg-primary-container text-on-primary-container' : 'hover:bg-on-surface/[0.08] text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {videoOn ? 'videocam' : 'videocam_off'}
          </span>
        </button>

        <button 
          onClick={shareScreen} 
          title="Share Screen" 
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-on-surface/[0.08] text-on-surface transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">screen_share</span>
        </button>

        <button 
          onClick={handleLeave} 
          title="Disconnect" 
          className="w-9 h-9 flex items-center justify-center rounded-full bg-error text-on-error hover:bg-error/90 transition-all shadow-elevation-1"
        >
          <span className="material-symbols-outlined text-[20px] filled">call_end</span>
        </button>
      </div>
    </div>
  );
}