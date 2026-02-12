import { useEffect, useState, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { gateway } from '../services/gateway';
import { Hash, Volume2, Settings, Plus, Smile, Gift, Search, Bell, ShieldAlert, Lock } from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { api } from '../services/api';
import { GifPicker } from '../components/GifPicker';
import { SearchModal } from '../components/SearchModal';
import { QuickSwitcher } from '../components/QuickSwitcher';
import { VoiceControls } from '../components/VoiceControls';
import { GuildSettingsModal } from '../components/GuildSettingsModal';
import { AdminDashboard } from '../components/AdminDashboard';
import { NotificationList } from '../components/NotificationList';
import { TwoFactorSetup } from '../components/TwoFactorSetup';
import { VideoGrid } from '../components/VideoGrid';

export function ChatLayout() {
  const { 
    guilds, currentGuild, currentChannel, messages, activeVoiceStreams,
    fetchGuilds, selectGuild, selectChannel, addMessage 
  } = useChatStore();
  const { user, logout } = useAuthStore();
  
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showGuildSettings, setShowGuildSettings] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGuilds();
    const token = localStorage.getItem('access_token');
    if (token) gateway.connect(token);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSwitcher(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowSwitcher(false);
        setShowSearch(false);
        setShowEmoji(false);
        setShowGif(false);
        setShowGuildSettings(false);
        setShowAdmin(false);
        setShowNotifications(false);
        setShow2FA(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (contentStr: string) => {
    if (!contentStr.trim() || !currentChannel) return;

    try {
      const res = await api.post(`/channels/${currentChannel.id}/messages`, { content: contentStr });
      addMessage(res.data);
      setInput('');
      setShowEmoji(false);
      setShowGif(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentChannel) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('content', input);

    try {
      const res = await api.post(`/channels/${currentChannel.id}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      addMessage(res.data);
      setInput('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-background-tertiary overflow-hidden">
      {showSearch && currentGuild && <SearchModal guildId={currentGuild.id} onClose={() => setShowSearch(false)} />}
      {showSwitcher && <QuickSwitcher onClose={() => setShowSwitcher(false)} />}
      {showGuildSettings && currentGuild && <GuildSettingsModal guildId={currentGuild.id} onClose={() => setShowGuildSettings(false)} />}
      {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}
      {show2FA && <TwoFactorSetup onClose={() => setShow2FA(false)} />}

      {/* Server Sidebar */}
      <div className="w-[72px] bg-background-tertiary flex flex-col items-center py-3 space-y-2 flex-shrink-0">
        <div className="w-12 h-12 bg-nautilus rounded-[24px] hover:rounded-[16px] transition-all duration-200 flex items-center justify-center text-white cursor-pointer group relative">
           <span className="text-xl">🐚</span>
        </div>
        
        <div className="w-8 h-[2px] bg-background-secondary rounded-full mx-auto my-1"></div>
        
        {guilds.map(guild => (
          <div 
            key={guild.id}
            onClick={() => selectGuild(guild.id)}
            className={`w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 flex items-center justify-center text-header-primary cursor-pointer group relative overflow-hidden ${currentGuild?.id === guild.id ? 'rounded-[16px] bg-nautilus text-white' : 'bg-background-primary'}`}
          >
            <span>{guild.name.substring(0, 1)}</span>
          </div>
        ))}

        <div className="w-12 h-12 bg-background-primary rounded-[24px] hover:rounded-[16px] hover:bg-green-600 transition-all duration-200 flex items-center justify-center text-green-500 hover:text-white cursor-pointer">
           <Plus size={24} />
        </div>

        {(user?.global_role === 'owner' || user?.global_role === 'admin' || user?.global_role === 'developer') && (
          <div 
            onClick={() => setShowAdmin(true)}
            className="w-12 h-12 bg-background-primary rounded-[24px] hover:rounded-[16px] hover:bg-yellow-600 transition-all duration-200 flex items-center justify-center text-yellow-500 hover:text-white cursor-pointer mt-auto mb-2"
          >
             <ShieldAlert size={24} />
          </div>
        )}
      </div>

      {/* Channel Sidebar */}
      <div className="w-60 bg-background-secondary flex flex-col flex-shrink-0">
        <div 
          onClick={() => currentGuild?.owner_id === user?.id && setShowGuildSettings(true)}
          className={`h-12 border-b border-background-tertiary flex items-center px-4 shadow-sm hover:bg-background-tertiary/30 transition-colors ${currentGuild?.owner_id === user?.id ? 'cursor-pointer' : ''}`}
        >
          <h1 className="font-bold text-header-primary truncate">{currentGuild?.name || 'Select Server'}</h1>
          {currentGuild?.owner_id === user?.id && <Settings size={16} className="ml-2 text-header-secondary" />}
        </div>
        
        <div className="flex-1 overflow-y-auto pt-4 px-2 space-y-0.5">
          {currentGuild?.channels.map(channel => (
            <div 
              key={channel.id}
              onClick={() => selectChannel(channel)}
              className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer group ${currentChannel?.id === channel.id ? 'bg-background-tertiary text-white' : 'text-header-secondary hover:bg-background-tertiary/50 hover:text-header-primary'}`}
            >
              <div className="flex items-center overflow-hidden">
                {channel.type === 'text' ? <Hash size={20} className="mr-1.5 opacity-60 flex-shrink-0" /> : <Volume2 size={20} className="mr-1.5 opacity-60 flex-shrink-0" />}
                <span className="font-medium truncate">{channel.name}</span>
              </div>
              {channel.type === 'voice' && (
                <div onClick={(e) => e.stopPropagation()}>
                  <VoiceControls channelId={channel.id} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="h-[52px] bg-[#232428] flex items-center px-2 space-x-2">
          <div className="w-8 h-8 rounded-full bg-nautilus flex-shrink-0"></div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white truncate leading-tight">{user?.display_name}</div>
            <div className="text-[12px] text-header-secondary truncate leading-tight">Online</div>
          </div>
          <div className="flex text-header-secondary">
            <button onClick={() => setShow2FA(true)} className="p-1.5 hover:bg-background-tertiary rounded cursor-pointer text-header-secondary hover:text-white" title="Security Settings">
              <Lock size={18} />
            </button>
            <div className="p-1.5 hover:bg-background-tertiary rounded cursor-pointer" onClick={logout} title="Logout"><Settings size={20} /></div>
          </div>
        </div>
      </div>

      {/* Main Chat/Voice Area */}
      <div className="flex-1 bg-background-primary flex flex-col min-w-0">
        <div className="h-12 border-b border-background-tertiary flex items-center px-4 shadow-sm z-10 justify-between">
           <div className="flex items-center">
             {currentChannel && (
               <>
                 {currentChannel.type === 'text' ? <Hash size={24} className="text-header-secondary mr-2" /> : <Volume2 size={24} className="text-header-secondary mr-2" />}
                 <span className="font-bold text-header-primary">{currentChannel.name}</span>
               </>
             )}
           </div>
           
           <div className="flex items-center space-x-4 text-header-secondary">
              <button 
                onClick={() => setShowSearch(true)}
                className="hover:text-header-primary transition-colors flex items-center bg-background-tertiary px-2 py-1 rounded text-sm"
              >
                <Search size={16} className="mr-2" />
                Search
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="hover:text-header-primary transition-colors p-1"
                >
                  <Bell size={24} />
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 z-[100]">
                    <NotificationList />
                  </div>
                )}
              </div>
           </div>
        </div>

        {currentChannel?.type === 'voice' ? (
          <VideoGrid streams={activeVoiceStreams} />
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="flex items-start group mt-4">
                  <div className="w-10 h-10 rounded-full bg-nautilus mr-4 mt-1 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <span className="font-bold text-header-primary hover:underline cursor-pointer mr-2">{msg.users.display_name}</span>
                      <span className="text-xs text-header-secondary">{new Date(msg.created_at).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-header-primary break-words whitespace-pre-wrap">{msg.content}</div>
                    
                    {/* Media/Embeds remain same... */}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 pt-0 relative">
              {showEmoji && (
                <div className="absolute bottom-20 right-4 z-50">
                  <EmojiPicker theme={Theme.DARK} onEmojiClick={(e) => setInput(prev => prev + e.emoji)} />
                </div>
              )}

              {showGif && (
                <div className="absolute bottom-20 right-4 z-50">
                  <GifPicker onSelect={(url) => handleSendMessage(url)} />
                </div>
              )}
              
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }} className="bg-background-secondary rounded-lg px-4 py-2.5 flex items-center space-x-3">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-header-secondary hover:text-header-primary transition-colors">
                  <Plus size={24} />
                </button>
                <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} />
                
                <input 
                  type="text" 
                  placeholder={`Message #${currentChannel?.name || '...'}`}
                  className="w-full bg-transparent border-none outline-none text-header-primary placeholder-header-secondary"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={!currentChannel}
                />
                
                <button type="button" onClick={() => { setShowGif(!showGif); setShowEmoji(false); }} className="text-header-secondary hover:text-header-primary transition-colors">
                  <Gift size={24} />
                </button>

                <button type="button" onClick={() => { setShowEmoji(!showEmoji); setShowGif(false); }} className="text-header-secondary hover:text-header-primary transition-colors">
                  <Smile size={24} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}