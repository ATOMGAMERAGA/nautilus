import { useState } from 'react';
import { voiceController } from '../services/voiceController';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, MonitorUp } from 'lucide-react';

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
    else {
      // Logic to restart audio produce
    }
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
        className="flex items-center space-x-2 text-green-500 hover:text-green-400 font-bold text-sm uppercase tracking-wide"
      >
        <Phone size={16} />
        <span>Join Voice</span>
      </button>
    );
  }

  return (
    <div className="flex items-center space-x-2 bg-black/20 p-2 rounded">
      <div className="text-xs font-bold text-green-500">Voice Connected</div>
      <div className="flex space-x-1">
        <button onClick={toggleMute} title="Toggle Mic" className={`p-1.5 rounded hover:bg-background-tertiary ${muted ? 'text-red-500' : 'text-header-primary'}`}>
          {muted ? <MicOff size={16} /> : <Mic size={16} />}
        </button>
        
        <button onClick={toggleVideo} title="Toggle Video" className={`p-1.5 rounded hover:bg-background-tertiary ${videoOn ? 'text-nautilus' : 'text-header-primary'}`}>
          {videoOn ? <Video size={16} /> : <VideoOff size={16} />}
        </button>

        <button onClick={shareScreen} title="Share Screen" className="p-1.5 rounded hover:bg-background-tertiary text-header-primary">
          <MonitorUp size={16} />
        </button>

        <button onClick={handleLeave} title="Disconnect" className="p-1.5 rounded hover:bg-background-tertiary text-red-500">
          <PhoneOff size={16} />
        </button>
      </div>
    </div>
  );
}