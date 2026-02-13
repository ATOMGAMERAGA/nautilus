import React, { useState, useEffect, useRef } from 'react';
import type { Channel, Message } from '../../data/mock';

interface ChatAreaProps {
  channel: Channel;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onToggleMemberList: () => void;
  isMemberListOpen: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  channel,
  messages,
  onSendMessage,
  onToggleMemberList,
  isMemberListOpen
}) => {
  const [inputValue, setInputValue] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <main className="flex-1 flex flex-col bg-surface overflow-hidden relative">
      {/* Top Bar */}
      <header className="h-12 px-4 flex items-center justify-between border-b border-outline-variant/20 bg-surface z-10 shadow-sm">
        <div className="flex items-center overflow-hidden">
          <span className="material-symbols-outlined text-on-surface-variant mr-2 text-[24px]">
            {channel.type === 'voice' ? 'volume_up' : 'tag'}
          </span>
          <h2 className="text-title-medium font-bold text-on-surface truncate mr-4">
            {channel.name}
          </h2>
          <span className="text-body-small text-on-surface-variant truncate hidden sm:block opacity-70 border-l border-outline-variant pl-4">
            {channel.type === 'voice' ? 'Voice Channel' : 'Start of your conversation'}
          </span>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-3 text-on-surface-variant">
           <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors" title="Search">
             <span className="material-symbols-outlined text-[20px]">search</span>
           </button>
           <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors" title="Pinned Messages">
             <span className="material-symbols-outlined text-[20px]">push_pin</span>
           </button>
           <button 
             className={`p-2 hover:bg-surface-container-high rounded-full transition-colors ${isMemberListOpen ? 'text-primary bg-surface-container-highest' : ''}`}
             onClick={onToggleMemberList}
             title="Toggle Member List"
           >
             <span className="material-symbols-outlined text-[20px]">group</span>
           </button>
           {/* Mobile Menu Trigger could go here */}
        </div>
      </header>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {/* Empty State / Welcome */}
        <div className="mt-8 mb-12 text-center opacity-60">
          <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px] text-primary">tag</span>
          </div>
          <h3 className="text-title-large font-bold text-on-surface mb-2">
            Welcome to #{channel.name}!
          </h3>
          <p className="text-body-medium text-on-surface-variant">
            This is the start of the #{channel.name} channel.
          </p>
        </div>

        {messages.map((msg, index) => {
          const prevMsg = messages[index - 1];
          const isCompact = prevMsg && prevMsg.author.id === msg.author.id && (new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() < 5 * 60000); // Simple check

          return (
            <div 
              key={msg.id} 
              className={`group flex pl-2 pr-4 py-0.5 hover:bg-surface-container-lowest/50 -mx-4 px-4 transition-colors relative ${isCompact ? 'mt-0.5' : 'mt-4'}`}
            >
              {/* Hover Actions (Floating) */}
              <div className="absolute right-4 top-[-12px] bg-surface-container-highest shadow-elevation-2 rounded-full px-2 py-1 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0 z-10 border border-outline-variant/20">
                <button className="p-1 hover:text-primary rounded-full hover:bg-surface-variant transition-colors"><span className="material-symbols-outlined text-[18px]">add_reaction</span></button>
                <button className="p-1 hover:text-primary rounded-full hover:bg-surface-variant transition-colors"><span className="material-symbols-outlined text-[18px]">reply</span></button>
                <button className="p-1 hover:text-error rounded-full hover:bg-surface-variant transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
              </div>

              {/* Avatar (only if not compact) */}
              {!isCompact ? (
                <div className="w-10 h-10 shrink-0 mr-4 mt-0.5 cursor-pointer hover:opacity-80 transition-opacity">
                  <img src={msg.author.avatar} alt={msg.author.username} className="w-full h-full rounded-full object-cover" />
                </div>
              ) : (
                <div className="w-10 shrink-0 mr-4 text-xs text-on-surface-variant text-right opacity-0 group-hover:opacity-100 select-none pt-1">
                  {/* Timestamp on hover for compact messages */}
                  <span className="text-[10px]">10:30</span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                {!isCompact && (
                  <div className="flex items-center items-baseline mb-1">
                    <span 
                      className="text-label-large font-bold mr-2 cursor-pointer hover:underline"
                      style={{ color: msg.author.roleColor }}
                    >
                      {msg.author.username}
                    </span>
                    <span className="text-label-small text-on-surface-variant ml-1">
                      {msg.timestamp}
                    </span>
                  </div>
                )}
                
                {/* Reply Context */}
                {msg.replyTo && (
                  <div className="flex items-center mb-1 opacity-70 text-xs text-on-surface-variant before:content-[''] before:block before:w-8 before:h-2 before:border-l-2 before:border-t-2 before:border-outline-variant before:mr-2 before:rounded-tl-md">
                     <span className="font-bold mr-1">@{msg.replyTo.author.username}</span> {msg.replyTo.content}
                  </div>
                )}

                <div className={`text-body-large text-on-surface/90 whitespace-pre-wrap leading-relaxed ${msg.isEdited ? 'italic' : ''}`}>
                  {msg.content}
                  {msg.isEdited && <span className="text-[10px] text-on-surface-variant ml-1">(edited)</span>}
                </div>

                {/* Attachments */}
                {msg.attachments?.map((att, i) => (
                   <div key={i} className="mt-2 max-w-sm rounded-lg overflow-hidden border border-outline-variant/30 bg-surface-container">
                      {att.type === 'image' ? (
                        <img src={`https://placehold.co/400x300/1B5FA8/FFFFFF?text=${att.name}`} alt={att.name} className="w-full h-auto cursor-zoom-in" />
                      ) : (
                        <div className="p-3 flex items-center">
                          <span className="material-symbols-outlined text-[32px] text-primary mr-3">description</span>
                          <div className="flex-1 overflow-hidden">
                            <div className="truncate font-bold text-sm">{att.name}</div>
                            <div className="text-xs text-on-surface-variant">{att.size}</div>
                          </div>
                          <span className="material-symbols-outlined cursor-pointer hover:text-primary">download</span>
                        </div>
                      )}
                   </div>
                ))}

                {/* Embeds */}
                {msg.embeds?.map((embed, i) => (
                  <div key={i} className="mt-2 flex border-l-4 rounded bg-surface-container p-3 max-w-md shadow-sm" style={{ borderColor: embed.color }}>
                    <div className="flex-1">
                       <div className="text-title-small font-bold mb-1" style={{ color: embed.color }}>{embed.title}</div>
                       <div className="text-body-medium text-on-surface-variant">{embed.description}</div>
                    </div>
                    {embed.image && <img src={embed.image} className="w-16 h-16 rounded ml-3 object-cover" />}
                  </div>
                ))}

                {/* Reactions */}
                {msg.reactions && msg.reactions.length > 0 && (
                   <div className="flex flex-wrap gap-1 mt-1.5">
                     {msg.reactions.map((react, i) => (
                       <button 
                         key={i}
                         className={`flex items-center px-1.5 py-0.5 rounded-full border text-xs font-medium transition-colors
                           ${react.me 
                             ? 'bg-primary-container border-primary-container text-on-primary-container' 
                             : 'bg-transparent border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                           }
                         `}
                       >
                         <span className="mr-1">{react.emoji}</span>
                         {react.count}
                       </button>
                     ))}
                   </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-surface z-20">
        <div className="flex items-end bg-surface-container-high rounded-[24px] px-2 py-2 shadow-elevation-1 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
          <button className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-highest transition-colors">
            <span className="material-symbols-outlined text-[24px]">add_circle</span>
          </button>
          
          <div className="flex-1 mx-2 py-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message #${channel.name}`}
              className="w-full bg-transparent border-none focus:outline-none text-on-surface placeholder:text-on-surface-variant/50 resize-none max-h-32 overflow-y-auto"
              rows={1}
              style={{ minHeight: '24px' }}
            />
          </div>

          <div className="flex items-center space-x-1">
            <button className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-highest transition-colors">
              <span className="material-symbols-outlined text-[24px]">card_giftcard</span>
            </button>
            <button className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-highest transition-colors">
              <span className="material-symbols-outlined text-[24px]">emoji_emotions</span>
            </button>
            {inputValue.trim() ? (
              <button 
                onClick={handleSend}
                className="p-2 bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-colors shadow-elevation-2 animate-scale-in"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            ) : (
              <button className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-highest transition-colors">
                <span className="material-symbols-outlined text-[24px]">mic</span>
              </button>
            )}
          </div>
        </div>
        {/* Typing Indicator (Hidden by default) */}
        <div className="h-4 mt-1 text-xs font-bold text-on-surface-variant animate-pulse hidden">
           Nemo is typing...
        </div>
      </div>
    </main>
  );
};
