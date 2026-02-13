import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Channel, Message, Reaction } from '../../data/mock';
import { EMOJI_CATEGORIES } from '../../data/mock';

interface ChatAreaProps {
  channel: Channel;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onToggleMemberList: () => void;
  isMemberListOpen: boolean;
  onOpenSearch?: () => void;
  onImageClick?: (url: string) => void;
}

const formatDateSeparator = (timestamp: string): string => {
  if (timestamp.startsWith('Today')) return 'Today';
  if (timestamp.startsWith('Yesterday')) return 'Yesterday';
  return timestamp.split(' at ')[0] || timestamp;
};

const shouldCompact = (prev: Message | undefined, cur: Message): boolean => {
  if (!prev) return false;
  if (prev.author.id !== cur.author.id) return false;
  if (cur.replyTo) return false;
  const prevBase = prev.timestamp.split(' at ')[0];
  const curBase = cur.timestamp.split(' at ')[0];
  return prevBase === curBase;
};

const shortTime = (timestamp: string): string => {
  const parts = timestamp.split(' at ');
  return parts[1] || timestamp;
};

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const filteredEmojis = useMemo(() => {
    if (!search.trim()) return null;
    const results: string[] = [];
    EMOJI_CATEGORIES.forEach((cat) => {
      cat.emojis.forEach((e) => {
        if (!results.includes(e)) results.push(e);
      });
    });
    return results.slice(0, 40);
  }, [search]);

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-full right-2 mb-2 w-[320px] max-h-[400px] bg-surface-container rounded-[28px] shadow-elevation-3 border border-outline-variant/10 flex flex-col animate-scale-in z-50 overflow-hidden"
    >
      <div className="p-4 border-b border-outline-variant/10">
        <div className="m3-search-bar !h-11 !shadow-none !bg-surface-container-highest">
          <span className="material-symbols-outlined text-primary text-[20px]">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emoji"
            className="flex-1 bg-transparent text-body-medium text-on-surface outline-none"
            autoFocus
          />
        </div>
      </div>

      {!search.trim() && (
        <div className="flex overflow-x-auto px-2 pt-1 pb-0.5 gap-1 no-scrollbar border-b border-outline-variant/10">
          {EMOJI_CATEGORIES.map((cat, i) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(i)}
              className={`shrink-0 px-3 py-1.5 text-label-small rounded-full transition-colors whitespace-nowrap ${
                activeCategory === i
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-on-surface/[0.08]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 thin-scrollbar">
        {search.trim() && filteredEmojis ? (
          <div className="grid grid-cols-7 gap-1">
            {filteredEmojis.map((emoji, i) => (
              <button
                key={`${emoji}-${i}`}
                onClick={() => onSelect(emoji)}
                className="w-10 h-10 flex items-center justify-center text-xl hover:bg-on-surface/[0.08] rounded-full transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {EMOJI_CATEGORIES[activeCategory]?.emojis.map((emoji, i) => (
              <button
                key={`${emoji}-${i}`}
                onClick={() => onSelect(emoji)}
                className="w-10 h-10 flex items-center justify-center text-xl hover:bg-on-surface/[0.08] rounded-full transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const ChatArea: React.FC<ChatAreaProps> = ({
  channel,
  messages,
  onSendMessage,
  onToggleMemberList,
  isMemberListOpen,
  onOpenSearch,
  onImageClick,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const [localReactions, setLocalReactions] = useState<Record<string, Reaction[]>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [newMessageDividerAfter, setNewMessageDividerAfter] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndCountRef = useRef(messages.length);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (messages.length > messagesEndCountRef.current && messagesEndCountRef.current > 0) {
      setNewMessageDividerAfter(messages[messagesEndCountRef.current - 1]?.id ?? null);
    }
    messagesEndCountRef.current = messages.length;
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => setIsTyping(true), 4000);
    const hide = setTimeout(() => setIsTyping(false), 8000);
    return () => {
      clearTimeout(timer);
      clearTimeout(hide);
    };
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue.trim());
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setShowEmojiPicker(false);
  }, [inputValue, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const insertEmoji = useCallback(
    (emoji: string) => {
      const el = textareaRef.current;
      if (el) {
        const start = el.selectionStart ?? inputValue.length;
        const end = el.selectionEnd ?? inputValue.length;
        const next = inputValue.slice(0, start) + emoji + inputValue.slice(end);
        setInputValue(next);
        requestAnimationFrame(() => {
          el.focus();
          el.selectionStart = el.selectionEnd = start + emoji.length;
        });
      } else {
        setInputValue((v) => v + emoji);
      }
    },
    [inputValue],
  );

  const toggleReaction = useCallback(
    (msgId: string, reactionIndex: number) => {
      setLocalReactions((prev) => {
        const msg = messages.find((m) => m.id === msgId);
        if (!msg?.reactions) return prev;
        const current = prev[msgId] ?? msg.reactions.map((r) => ({ ...r }));
        const updated = current.map((r, i) => {
          if (i !== reactionIndex) return r;
          return {
            ...r,
            me: !r.me,
            count: r.me ? r.count - 1 : r.count + 1,
          };
        });
        return { ...prev, [msgId]: updated };
      });
    },
    [messages],
  );

  const getReactions = useCallback(
    (msg: Message): Reaction[] => {
      return localReactions[msg.id] ?? msg.reactions ?? [];
    },
    [localReactions],
  );

  return (
    <main className="flex-1 flex flex-col bg-surface overflow-hidden relative">
      <header className="h-16 px-4 flex items-center justify-between border-b border-outline-variant/10 bg-surface z-10 shrink-0">
        <div className="flex items-center min-w-0">
          <span className="material-symbols-outlined text-primary mr-3 text-[24px] shrink-0">
            {channel.type === 'announcement' ? 'campaign' : channel.type === 'voice' ? 'volume_up' : 'tag'}
          </span>
          <div className="flex flex-col overflow-hidden">
            <h2 className="text-title-medium font-bold text-on-surface truncate leading-tight">
              {channel.name}
            </h2>
            {channel.topic && (
              <p className="text-[11px] text-on-surface-variant truncate opacity-80 leading-tight hidden sm:block">
                {channel.topic}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          <button onClick={onOpenSearch} className="m3-icon-button hidden md:flex"><span className="material-symbols-outlined text-[22px]">search</span></button>
          <button className="m3-icon-button hidden md:flex"><span className="material-symbols-outlined text-[22px]">push_pin</span></button>
          <button onClick={onToggleMemberList} className={`m3-icon-button ${isMemberListOpen ? 'bg-secondary-container text-on-secondary-container' : ''}`}><span className={`material-symbols-outlined text-[22px] ${isMemberListOpen ? 'filled' : ''}`}>group</span></button>
          <button className="m3-icon-button"><span className="material-symbols-outlined text-[22px]">more_vert</span></button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scroll-smooth thin-scrollbar" id="message-scroll-area">
        <div className="pt-12 pb-8 px-6">
          <div className="w-20 h-20 bg-primary-container rounded-[24px] flex items-center justify-center mb-6 shadow-elevation-1">
            <span className="material-symbols-outlined text-[40px] text-on-primary-container">
              {channel.type === 'announcement' ? 'campaign' : 'tag'}
            </span>
          </div>
          <h3 className="text-headline-medium font-bold text-on-surface mb-2">Welcome to #{channel.name}!</h3>
          <p className="text-body-large text-on-surface-variant max-w-2xl leading-relaxed">
            This is the start of the <span className="font-semibold text-primary">#{channel.name}</span> channel.
            {channel.topic && <span className="opacity-80"> — {channel.topic}</span>}
          </p>
        </div>

        {messages.length > 0 && (
          <div className="flex items-center px-6 my-6">
            <div className="flex-1 h-px bg-outline-variant/30" />
            <span className="px-4 py-1 text-label-medium font-bold text-on-surface-variant bg-surface-container rounded-full mx-4 border border-outline-variant/10">
              {formatDateSeparator(messages[0].timestamp)}
            </span>
            <div className="flex-1 h-px bg-outline-variant/30" />
          </div>
        )}

        <div className="pb-6">
          {messages.map((msg, index) => {
            const prevMsg = index > 0 ? messages[index - 1] : undefined;
            const compact = shouldCompact(prevMsg, msg);
            const reactions = getReactions(msg);
            const showNewDivider = newMessageDividerAfter && prevMsg?.id === newMessageDividerAfter;

            return (
              <React.Fragment key={msg.id}>
                {showNewDivider && (
                  <div className="flex items-center px-6 my-6">
                    <div className="flex-1 h-px bg-error/40" />
                    <span className="px-4 py-1 text-label-small font-black text-error bg-error-container rounded-full mx-4">NEW MESSAGES</span>
                    <div className="flex-1 h-px bg-error/40" />
                  </div>
                )}

                <div
                  className={`group relative flex px-6 transition-all duration-200 hover:bg-on-surface/[0.04] ${compact ? 'py-0.5' : 'pt-4 pb-0.5'}`}
                  onMouseEnter={() => setHoveredMsgId(msg.id)}
                  onMouseLeave={() => setHoveredMsgId(null)}
                >
                  {hoveredMsgId === msg.id && (
                    <div className="absolute right-6 -top-4 bg-surface-container-highest shadow-elevation-2 rounded-full p-1 flex items-center z-20 border border-outline-variant/20 animate-scale-in">
                      <button className="w-8 h-8 flex items-center justify-center hover:bg-on-surface/[0.08] rounded-full transition-colors"><span className="material-symbols-outlined text-[18px]">add_reaction</span></button>
                      <button className="w-8 h-8 flex items-center justify-center hover:bg-on-surface/[0.08] rounded-full transition-colors text-primary"><span className="material-symbols-outlined text-[18px]">reply</span></button>
                      <button className="w-8 h-8 flex items-center justify-center hover:bg-on-surface/[0.08] rounded-full transition-colors text-error"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                    </div>
                  )}

                  {!compact ? (
                    <div className="w-10 h-10 shrink-0 mr-4 mt-0.5">
                      <img src={msg.author.avatar} alt="" className="w-full h-full rounded-full object-cover border border-outline-variant/10 shadow-sm" />
                    </div>
                  ) : (
                    <div className="w-10 shrink-0 mr-4 flex items-center justify-end">
                      <span className="text-[10px] font-medium text-on-surface-variant/50 opacity-0 group-hover:opacity-100 select-none transition-opacity">{shortTime(msg.timestamp)}</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {!compact && (
                      <div className="flex items-baseline mb-1">
                        <span className="text-label-large font-bold mr-2 cursor-pointer hover:underline" style={{ color: msg.author.roleColor || undefined }}>{msg.author.username}</span>
                        <span className="text-[11px] font-medium text-on-surface-variant/60">{msg.timestamp}</span>
                      </div>
                    )}

                    {msg.replyTo && (
                      <div className="flex items-center mb-2 bg-surface-container-high/50 w-fit pr-3 rounded-full py-0.5 ml-[-4px]">
                        <div className="w-1 h-4 bg-primary rounded-full mx-1.5 shrink-0" />
                        <img src={msg.replyTo.author.avatar} alt="" className="w-4 h-4 rounded-full mr-2 shrink-0" />
                        <span className="text-[11px] font-bold mr-2 shrink-0" style={{ color: msg.replyTo.author.roleColor || undefined }}>{msg.replyTo.author.username}</span>
                        <span className="text-[11px] text-on-surface-variant truncate max-w-[200px] italic">{msg.replyTo.content}</span>
                      </div>
                    )}

                    <div className="text-body-medium text-on-surface whitespace-pre-wrap leading-relaxed break-words">
                      {msg.content}
                      {msg.isEdited && <span className="text-[10px] font-medium text-on-surface-variant/40 ml-1.5 italic select-none">(edited)</span>}
                    </div>

                    {msg.attachments?.filter(a => a.type === 'image').map((att, i) => (
                      <div key={`img-${i}`} className="mt-3 max-w-[400px] max-h-[300px] rounded-[20px] overflow-hidden cursor-pointer hover:shadow-elevation-1 transition-all border border-outline-variant/10 shadow-sm" onClick={() => att.url && onImageClick?.(att.url)}>
                        <img src={att.url || `https://placehold.co/400x300/1B5FA8/FFFFFF?text=${encodeURIComponent(att.name)}`} alt={att.name} className="w-full h-auto object-cover" />
                      </div>
                    ))}

                    {msg.attachments?.filter(a => a.type === 'file').map((att, i) => (
                      <div key={`file-${i}`} className="mt-3 max-w-[360px] flex items-center bg-surface-container-high rounded-[16px] border border-outline-variant/10 p-4 shadow-sm">
                        <div className="w-12 h-12 rounded-[12px] bg-primary-container flex items-center justify-center text-primary mr-4 shrink-0"><span className="material-symbols-outlined text-[28px]">description</span></div>
                        <div className="flex-1 min-w-0 mr-3"><p className="text-label-large font-bold text-on-surface truncate">{att.name}</p><p className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">{att.size}</p></div>
                        <button className="m3-icon-button shrink-0"><span className="material-symbols-outlined text-[22px]">download</span></button>
                      </div>
                    ))}

                    {msg.embeds?.map((embed, i) => (
                      <div key={`embed-${i}`} className="mt-3 max-w-[480px] flex rounded-[16px] bg-surface-container border border-outline-variant/10 overflow-hidden shadow-sm">
                        <div className="w-1.5 shrink-0" style={{ backgroundColor: embed.color || 'var(--md-sys-color-primary)' }} />
                        <div className="flex-1 p-4 min-w-0">
                          {embed.siteName && <p className="text-[10px] font-black text-primary uppercase tracking-[0.1em] mb-1">{embed.siteName}</p>}
                          <p className="text-label-large font-bold mb-1.5 cursor-pointer hover:underline text-on-surface">{embed.title}</p>
                          <p className="text-body-small text-on-surface-variant leading-snug">{embed.description}</p>
                          {embed.image && <img src={embed.image} alt="" className="mt-3 rounded-[12px] max-w-full h-auto" />}
                        </div>
                        {embed.thumbnail && <img src={embed.thumbnail} alt="" className="w-20 h-20 object-cover m-4 rounded-[12px] shrink-0" />}
                      </div>
                    ))}

                    {reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {reactions.map((react, i) => (
                          <button key={`${react.emoji}-${i}`} onClick={() => toggleReaction(msg.id, i)} className={`inline-flex items-center h-7 px-2.5 rounded-full text-[11px] font-bold border transition-all ${react.me ? 'bg-primary-container border-primary/20 text-on-primary-container shadow-sm' : 'bg-surface-container-highest border-outline-variant/10 text-on-surface-variant hover:bg-on-surface/[0.08]'}`}>
                            <span className="mr-1.5 text-sm">{react.emoji}</span>{react.count}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
          <div ref={bottomRef} className="h-1" />
        </div>
      </div>

      <div className="px-4 pt-2 pb-4 bg-surface z-20 shrink-0 relative">
        {showEmojiPicker && <EmojiPicker onSelect={insertEmoji} onClose={() => setShowEmojiPicker(false)} />}
        <div className="flex items-end bg-surface-container-high rounded-[28px] px-2 py-2 shadow-elevation-1 focus-within:shadow-elevation-2 transition-all min-h-[56px]">
          <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary rounded-full hover:bg-on-surface/[0.08] transition-colors shrink-0"><span className="material-symbols-outlined text-[24px]">add</span></button>
          <div className="flex-1 mx-2 py-2 min-w-0">
            <textarea ref={textareaRef} value={inputValue} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder={`Message #${channel.name}`} className="w-full bg-transparent border-none focus:outline-none text-body-large text-on-surface placeholder:text-on-surface-variant/50 resize-none max-h-40 overflow-y-auto leading-normal" rows={1} style={{ minHeight: '24px' }} />
          </div>
          <div className="flex items-center shrink-0">
            <button onClick={() => setShowEmojiPicker((p) => !p)} className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${showEmojiPicker ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary hover:bg-on-surface/[0.08]'}`}><span className="material-symbols-outlined text-[24px]">sentiment_satisfied</span></button>
            {inputValue.trim() ? (
              <button onClick={handleSend} className="w-10 h-10 flex items-center justify-center bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-all shadow-elevation-2 ml-1"><span className="material-symbols-outlined text-[20px] filled">send</span></button>
            ) : (
              <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary rounded-full hover:bg-on-surface/[0.08] transition-colors"><span className="material-symbols-outlined text-[24px]">mic</span></button>
            )}
          </div>
        </div>
        {isTyping && (
          <div className="absolute left-10 -top-1 bg-surface-container-low px-3 py-1 rounded-full shadow-elevation-1 animate-fade-in flex items-center gap-2 border border-outline-variant/10">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Typing</span>
          </div>
        )}
      </div>
    </main>
  );
};