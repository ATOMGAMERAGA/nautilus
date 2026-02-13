import { useEffect, useState, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { gateway } from '../services/gateway';
import { secureStorage } from '../services/secureStorage';
import { isNative } from '../services/platform';
import { Hash, Volume2, Settings, Plus, Smile, Gift, Search, Bell, ShieldAlert, Lock, Send, ChevronDown, Shell, LogOut } from 'lucide-react';
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
    secureStorage.getAccessToken().then(token => {
      if (token) gateway.connect(token);
    });

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
    <div className={`flex h-screen bg-background-tertiary overflow-hidden${isNative ? ' native-app' : ''}`}>
      {showSearch && currentGuild && <SearchModal guildId={currentGuild.id} onClose={() => setShowSearch(false)} />}
      {showSwitcher && <QuickSwitcher onClose={() => setShowSwitcher(false)} />}
      {showGuildSettings && currentGuild && <GuildSettingsModal guildId={currentGuild.id} onClose={() => setShowGuildSettings(false)} />}
      {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}
      {show2FA && <TwoFactorSetup onClose={() => setShow2FA(false)} />}

      {/* Server Sidebar */}
      <div className="w-[72px] bg-background-tertiary flex flex-col items-center py-3 gap-2 flex-shrink-0">
        <div
          className="tooltip-container w-12 h-12 bg-[#5865f2] rounded-[24px] hover:rounded-[16px] transition-all duration-300 flex items-center justify-center text-white cursor-pointer shadow-lg shadow-[#5865f2]/20 hover:shadow-[#5865f2]/40"
          data-tooltip="Home"
        >
          <Shell size={24} />
        </div>

        <div className="w-8 h-[2px] bg-white/[0.06] rounded-full mx-auto" />

        {guilds.map((guild, index) => (
          <div
            key={guild.id}
            onClick={() => selectGuild(guild.id)}
            className={`tooltip-container w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-300 flex items-center justify-center cursor-pointer relative overflow-hidden text-[15px] font-semibold ${
              currentGuild?.id === guild.id
                ? 'rounded-[16px] bg-[#5865f2] text-white shadow-lg shadow-[#5865f2]/20'
                : 'bg-[#313338] text-[#b5bac1] hover:bg-[#5865f2] hover:text-white'
            }`}
            data-tooltip={guild.name}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {guild.icon_url ? (
              <img src={guild.icon_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span>{guild.name.substring(0, 1).toUpperCase()}</span>
            )}
            {currentGuild?.id === guild.id && (
              <div className="absolute left-0 top-1/2 -translate-x-[22px] -translate-y-1/2 w-2 h-10 bg-white rounded-r-full transition-all" />
            )}
          </div>
        ))}

        <div className="tooltip-container w-12 h-12 bg-[#313338] rounded-[24px] hover:rounded-[16px] hover:bg-[#23a559] transition-all duration-300 flex items-center justify-center text-[#23a559] hover:text-white cursor-pointer" data-tooltip="Add Server">
           <Plus size={22} />
        </div>

        <div className="flex-1" />

        {(user?.global_role === 'owner' || user?.global_role === 'admin' || user?.global_role === 'developer') && (
          <div
            onClick={() => setShowAdmin(true)}
            className="tooltip-container w-12 h-12 bg-[#313338] rounded-[24px] hover:rounded-[16px] hover:bg-amber-600 transition-all duration-300 flex items-center justify-center text-amber-500 hover:text-white cursor-pointer mb-2"
            data-tooltip="Admin"
          >
             <ShieldAlert size={22} />
          </div>
        )}
      </div>

      {/* Channel Sidebar */}
      <div className="w-60 bg-background-secondary flex flex-col flex-shrink-0">
        <div
          onClick={() => currentGuild?.owner_id === user?.id && setShowGuildSettings(true)}
          className={`h-12 border-b border-black/20 flex items-center justify-between px-4 shadow-sm hover:bg-white/[0.02] transition-all ${currentGuild?.owner_id === user?.id ? 'cursor-pointer' : ''}`}
        >
          <h1 className="font-bold text-[15px] text-white truncate">{currentGuild?.name || 'Select Server'}</h1>
          {currentGuild?.owner_id === user?.id ? (
            <ChevronDown size={18} className="text-[#b5bac1] flex-shrink-0" />
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto pt-4 px-2 space-y-0.5">
          {currentGuild?.channels.map(channel => (
            <div
              key={channel.id}
              onClick={() => selectChannel(channel)}
              className={`channel-item flex items-center justify-between px-2 py-[6px] cursor-pointer group ${
                currentChannel?.id === channel.id
                  ? 'active bg-white/[0.06] text-white'
                  : 'text-[#949ba4] hover:text-[#dbdee1]'
              }`}
            >
              <div className="flex items-center overflow-hidden gap-1.5">
                {channel.type === 'text' ? (
                  <Hash size={20} className={`flex-shrink-0 ${currentChannel?.id === channel.id ? 'text-white/70' : 'text-[#6d6f78]'}`} />
                ) : (
                  <Volume2 size={20} className={`flex-shrink-0 ${currentChannel?.id === channel.id ? 'text-white/70' : 'text-[#6d6f78]'}`} />
                )}
                <span className="font-medium truncate text-[15px]">{channel.name}</span>
              </div>
              {channel.type === 'voice' && (
                <div onClick={(e) => e.stopPropagation()}>
                  <VoiceControls channelId={channel.id} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* User Panel */}
        <div className="h-[52px] bg-black/20 flex items-center px-2 gap-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#5865f2] flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
              {user?.display_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#23a559] rounded-full border-2 border-[#232428]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-white truncate leading-tight">{user?.display_name}</div>
            <div className="text-[11px] text-[#23a559] truncate leading-tight font-medium">Online</div>
          </div>
          <div className="flex items-center">
            <button onClick={() => setShow2FA(true)} className="p-1.5 rounded hover:bg-white/[0.06] text-[#b5bac1] hover:text-white transition-colors" title="Security">
              <Lock size={16} />
            </button>
            <button className="p-1.5 rounded hover:bg-white/[0.06] text-[#b5bac1] hover:text-[#f23f43] transition-colors" onClick={logout} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat/Voice Area */}
      <div className="flex-1 bg-background-primary flex flex-col min-w-0">
        {/* Header */}
        <div className="h-12 border-b border-black/20 flex items-center px-4 z-10 justify-between flex-shrink-0">
           <div className="flex items-center gap-2">
             {currentChannel && (
               <>
                 {currentChannel.type === 'text' ? (
                   <Hash size={22} className="text-[#6d6f78]" />
                 ) : (
                   <Volume2 size={22} className="text-[#6d6f78]" />
                 )}
                 <span className="font-bold text-white text-[15px]">{currentChannel.name}</span>
               </>
             )}
           </div>

           <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-1.5 bg-[#1e1f22] hover:bg-[#1e1f22]/80 px-3 py-1.5 rounded-md text-xs text-[#949ba4] hover:text-[#dbdee1] transition-colors"
              >
                <Search size={14} />
                <span>Search</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-1.5 rounded hover:bg-white/[0.06] text-[#b5bac1] hover:text-white transition-colors"
                >
                  <Bell size={20} />
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 z-[100] animate-fade-in-scale">
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
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
              {messages.length === 0 && currentChannel && (
                <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-[#5865f2]/10 flex items-center justify-center mb-4">
                    <Hash size={32} className="text-[#5865f2]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">Welcome to #{currentChannel.name}</h2>
                  <p className="text-[#949ba4] text-sm">This is the start of the channel. Send a message to begin!</p>
                </div>
              )}

              {messages.map((msg, index) => {
                const prevMsg = messages[index - 1];
                const sameAuthor = prevMsg?.author_id === msg.author_id;
                const timeDiff = prevMsg ? (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime()) / 60000 : Infinity;
                const isCompact = sameAuthor && timeDiff < 5;

                return (
                  <div key={msg.id} className={`message-row flex items-start group ${isCompact ? 'py-0.5' : 'pt-4 pb-0.5'}`}>
                    {isCompact ? (
                      <div className="w-10 mr-4 flex-shrink-0 flex items-center justify-center">
                        <span className="text-[10px] text-[#6d6f78] opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#5865f2] mr-4 mt-0.5 flex-shrink-0 flex items-center justify-center text-white text-sm font-bold">
                        {msg.users.display_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {!isCompact && (
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="font-semibold text-white hover:underline cursor-pointer text-[15px]">{msg.users.display_name}</span>
                          <span className="text-[11px] text-[#6d6f78] font-medium">
                            {new Date(msg.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                      <div className="text-[#dbdee1] break-words whitespace-pre-wrap text-[15px] leading-[1.375rem]">{msg.content}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input */}
            <div className="px-4 pb-6 pt-0 relative flex-shrink-0">
              {showEmoji && (
                <div className="absolute bottom-20 right-4 z-50 animate-fade-in-scale">
                  <EmojiPicker theme={Theme.DARK} onEmojiClick={(e) => setInput(prev => prev + e.emoji)} />
                </div>
              )}

              {showGif && (
                <div className="absolute bottom-20 right-4 z-50 animate-fade-in-scale">
                  <GifPicker onSelect={(url) => handleSendMessage(url)} />
                </div>
              )}

              <form
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
                className="bg-[#383a40] rounded-lg px-4 py-1 flex items-center gap-2 border border-transparent focus-within:border-[#5865f2]/30 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded hover:bg-white/[0.06] text-[#b5bac1] hover:text-white transition-colors flex-shrink-0"
                >
                  <Plus size={20} />
                </button>
                <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} />

                <input
                  type="text"
                  placeholder={`Message #${currentChannel?.name || '...'}`}
                  className="flex-1 bg-transparent border-none outline-none text-[#dbdee1] placeholder-[#6d6f78] text-[15px] py-2.5"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={!currentChannel}
                />

                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => { setShowGif(!showGif); setShowEmoji(false); }}
                    className="p-1.5 rounded hover:bg-white/[0.06] text-[#b5bac1] hover:text-white transition-colors"
                  >
                    <Gift size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowEmoji(!showEmoji); setShowGif(false); }}
                    className="p-1.5 rounded hover:bg-white/[0.06] text-[#b5bac1] hover:text-white transition-colors"
                  >
                    <Smile size={20} />
                  </button>

                  {input.trim() && (
                    <button
                      type="submit"
                      className="p-1.5 rounded bg-[#5865f2] hover:bg-[#4752c4] text-white transition-all ml-1 animate-fade-in-scale"
                    >
                      <Send size={18} />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
