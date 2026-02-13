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

/* ------------------------------------------------------------------ */
/*  Helper: format a date string into a readable date separator label */
/* ------------------------------------------------------------------ */
const formatDateSeparator = (timestamp: string): string => {
  if (timestamp.startsWith('Today')) return 'Today';
  if (timestamp.startsWith('Yesterday')) return 'Yesterday';
  return timestamp.split(' at ')[0] || timestamp;
};

/* ------------------------------------------------------------------ */
/*  Helper: should two consecutive messages be in "compact" mode?      */
/* ------------------------------------------------------------------ */
const shouldCompact = (prev: Message | undefined, cur: Message): boolean => {
  if (!prev) return false;
  if (prev.author.id !== cur.author.id) return false;
  if (cur.replyTo) return false;
  // Same author within the same timestamp block -> compact
  const prevBase = prev.timestamp.split(' at ')[0];
  const curBase = cur.timestamp.split(' at ')[0];
  return prevBase === curBase;
};

/* ------------------------------------------------------------------ */
/*  Helper: extract short time from timestamp string                   */
/* ------------------------------------------------------------------ */
const shortTime = (timestamp: string): string => {
  const parts = timestamp.split(' at ');
  return parts[1] || timestamp;
};

/* ------------------------------------------------------------------ */
/*  Emoji Picker                                                       */
/* ------------------------------------------------------------------ */
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
    // Simple filter: just return all (real app would match names)
    return results.slice(0, 40);
  }, [search]);

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-full right-2 mb-2 w-[340px] max-h-[380px] bg-surface-container-highest rounded-[16px] shadow-elevation-2 border border-outline-variant/20 flex flex-col animate-scale-in z-50 overflow-hidden"
    >
      {/* Search */}
      <div className="p-2 border-b border-outline-variant/20">
        <div className="flex items-center bg-surface-container rounded-[12px] px-3 py-1.5">
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant mr-2">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emoji"
            className="flex-1 bg-transparent text-body-small text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
            autoFocus
          />
        </div>
      </div>

      {/* Category Tabs */}
      {!search.trim() && (
        <div className="flex overflow-x-auto px-2 pt-1 pb-0.5 gap-1 scrollbar-hide border-b border-outline-variant/10">
          {EMOJI_CATEGORIES.map((cat, i) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(i)}
              className={`shrink-0 px-2.5 py-1 text-label-small rounded-full transition-colors whitespace-nowrap ${
                activeCategory === i
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Grid */}
      <div className="flex-1 overflow-y-auto p-2">
        {search.trim() && filteredEmojis ? (
          <div className="grid grid-cols-8 gap-0.5">
            {filteredEmojis.map((emoji, i) => (
              <button
                key={`${emoji}-${i}`}
                onClick={() => onSelect(emoji)}
                className="w-9 h-9 flex items-center justify-center text-xl hover:bg-surface-container-high rounded-[8px] transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : (
          <>
            <p className="text-label-small text-on-surface-variant px-1 mb-1">
              {EMOJI_CATEGORIES[activeCategory]?.name}
            </p>
            <div className="grid grid-cols-8 gap-0.5">
              {EMOJI_CATEGORIES[activeCategory]?.emojis.map((emoji, i) => (
                <button
                  key={`${emoji}-${i}`}
                  onClick={() => onSelect(emoji)}
                  className="w-9 h-9 flex items-center justify-center text-xl hover:bg-surface-container-high rounded-[8px] transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Typing Indicator                                                   */
/* ------------------------------------------------------------------ */
const TypingIndicator: React.FC<{ visible: boolean }> = ({ visible }) => {
  if (!visible) return null;
  return (
    <div className="h-5 mt-1 px-4 flex items-center text-label-small font-medium text-on-surface-variant animate-fade-in">
      <span className="inline-flex gap-[2px] mr-1.5">
        <span className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </span>
      Someone is typing...
    </div>
  );
};

/* ================================================================== */
/*  ChatArea Component                                                 */
/* ================================================================== */
export const ChatArea: React.FC<ChatAreaProps> = ({
  channel,
  messages,
  onSendMessage,
  onToggleMemberList,
  isMemberListOpen,
  onOpenSearch,
  onImageClick,
}) => {
  /* ----- State ----- */
  const [inputValue, setInputValue] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const [localReactions, setLocalReactions] = useState<Record<string, Reaction[]>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [newMessageDividerAfter, setNewMessageDividerAfter] = useState<string | null>(null);

  /* ----- Refs ----- */
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndCountRef = useRef(messages.length);

  /* ----- Auto-scroll on new messages ----- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (messages.length > messagesEndCountRef.current && messagesEndCountRef.current > 0) {
      // Mark where new messages start
      setNewMessageDividerAfter(messages[messagesEndCountRef.current - 1]?.id ?? null);
    }
    messagesEndCountRef.current = messages.length;
  }, [messages]);

  /* ----- Demo typing indicator ----- */
  useEffect(() => {
    const timer = setTimeout(() => setIsTyping(true), 4000);
    const hide = setTimeout(() => setIsTyping(false), 8000);
    return () => {
      clearTimeout(timer);
      clearTimeout(hide);
    };
  }, []);

  /* ----- Auto-resize textarea ----- */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, []);

  /* ----- Send logic ----- */
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

  /* ----- Emoji insertion ----- */
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

  /* ----- Reaction toggle ----- */
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

  /* ----- Get reactions for a message (local overrides) ----- */
  const getReactions = useCallback(
    (msg: Message): Reaction[] => {
      return localReactions[msg.id] ?? msg.reactions ?? [];
    },
    [localReactions],
  );

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */
  return (
    <main className="flex-1 flex flex-col bg-surface overflow-hidden relative">
      {/* ---------------------------------------------------------- */}
      {/*  Top Bar (48px)                                             */}
      {/* ---------------------------------------------------------- */}
      <header className="h-12 px-4 flex items-center justify-between border-b border-outline-variant/20 bg-surface z-10 shadow-sm shrink-0">
        {/* Left side */}
        <div className="flex items-center overflow-hidden min-w-0">
          <span className="material-symbols-outlined text-on-surface-variant mr-2 text-[22px] shrink-0">
            {channel.type === 'announcement' ? 'campaign' : channel.type === 'voice' ? 'volume_up' : 'tag'}
          </span>
          <h2 className="text-title-medium font-bold text-on-surface truncate shrink-0">
            {channel.name}
          </h2>
          {channel.topic && (
            <>
              <div className="w-px h-5 bg-outline-variant/40 mx-3 shrink-0 hidden md:block" />
              <p className="text-body-small text-on-surface-variant truncate hidden md:block opacity-70 min-w-0">
                {channel.topic}
              </p>
            </>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center space-x-1 text-on-surface-variant shrink-0">
          <button
            onClick={onOpenSearch}
            className="p-2 hover:bg-surface-container-high rounded-full transition-colors hidden md:flex items-center justify-center"
            title="Search"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>
          <button
            className="p-2 hover:bg-surface-container-high rounded-full transition-colors hidden md:flex items-center justify-center"
            title="Pinned Messages"
          >
            <span className="material-symbols-outlined text-[20px]">push_pin</span>
          </button>
          <button
            className={`p-2 rounded-full transition-colors flex items-center justify-center ${
              isMemberListOpen
                ? 'bg-surface-container-highest text-primary'
                : 'hover:bg-surface-container-high text-on-surface-variant'
            }`}
            onClick={onToggleMemberList}
            title="Toggle Member List"
          >
            <span className="material-symbols-outlined text-[20px]">group</span>
          </button>
          <button
            className="p-2 hover:bg-surface-container-high rounded-full transition-colors flex items-center justify-center"
            title="More"
          >
            <span className="material-symbols-outlined text-[20px]">more_vert</span>
          </button>
        </div>
      </header>

      {/* ---------------------------------------------------------- */}
      {/*  Message List                                                */}
      {/* ---------------------------------------------------------- */}
      <div className="flex-1 overflow-y-auto scroll-smooth" id="message-scroll-area">
        {/* Welcome / empty header */}
        <div className="pt-8 pb-6 px-4">
          <div className="w-[68px] h-[68px] bg-surface-container-high rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[36px] text-primary">
              {channel.type === 'announcement' ? 'campaign' : 'tag'}
            </span>
          </div>
          <h3 className="text-headline-small font-bold text-on-surface mb-1">
            Welcome to #{channel.name}!
          </h3>
          <p className="text-body-medium text-on-surface-variant">
            This is the start of the <span className="font-semibold">#{channel.name}</span> channel.
            {channel.topic && ` ${channel.topic}`}
          </p>
        </div>

        {/* Date separator - always shown at top */}
        {messages.length > 0 && (
          <div className="flex items-center px-4 my-2">
            <div className="flex-1 h-px bg-outline-variant/30" />
            <span className="px-3 py-0.5 text-label-small text-on-surface-variant bg-surface-container-high rounded-full mx-2">
              {formatDateSeparator(messages[0].timestamp)}
            </span>
            <div className="flex-1 h-px bg-outline-variant/30" />
          </div>
        )}

        {/* Messages */}
        <div className="pb-4">
          {messages.map((msg, index) => {
            const prevMsg = index > 0 ? messages[index - 1] : undefined;
            const compact = shouldCompact(prevMsg, msg);
            const reactions = getReactions(msg);
            const showNewDivider = newMessageDividerAfter && prevMsg?.id === newMessageDividerAfter;

            return (
              <React.Fragment key={msg.id}>
                {/* New messages divider */}
                {showNewDivider && (
                  <div className="flex items-center px-4 my-3">
                    <div className="flex-1 h-px bg-error/60" />
                    <span className="px-3 py-0.5 text-label-small font-semibold text-error bg-surface mx-2">
                      NEW MESSAGES
                    </span>
                    <div className="flex-1 h-px bg-error/60" />
                  </div>
                )}

                <div
                  className={`group relative flex px-4 transition-colors hover:bg-surface-container/40 ${
                    compact ? 'py-0.5' : 'pt-3 pb-0.5'
                  } ${msg.isPinned ? 'bg-primary-container/5' : ''}`}
                  onMouseEnter={() => setHoveredMsgId(msg.id)}
                  onMouseLeave={() => setHoveredMsgId(null)}
                >
                  {/* Pinned indicator */}
                  {msg.isPinned && (
                    <span className="absolute top-1 left-1 material-symbols-outlined text-[14px] text-primary/60">
                      push_pin
                    </span>
                  )}

                  {/* Hover action bar */}
                  {hoveredMsgId === msg.id && (
                    <div className="absolute right-4 -top-3 bg-surface-container-highest shadow-elevation-2 rounded-full px-1.5 py-0.5 flex items-center space-x-0.5 z-20 border border-outline-variant/20 animate-fade-in">
                      <button className="p-1 hover:text-primary rounded-full hover:bg-surface-container-high transition-colors">
                        <span className="material-symbols-outlined text-[18px]">add_reaction</span>
                      </button>
                      <button className="p-1 hover:text-primary rounded-full hover:bg-surface-container-high transition-colors">
                        <span className="material-symbols-outlined text-[18px]">reply</span>
                      </button>
                      <button className="p-1 hover:text-on-surface-variant rounded-full hover:bg-surface-container-high transition-colors">
                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                      </button>
                    </div>
                  )}

                  {/* Avatar column */}
                  {!compact ? (
                    <div className="w-10 h-10 shrink-0 mr-4 mt-0.5 cursor-pointer hover:opacity-80 transition-opacity">
                      <img
                        src={msg.author.avatar}
                        alt={msg.author.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 shrink-0 mr-4 flex items-center justify-end">
                      <span className="text-[10px] text-on-surface-variant opacity-0 group-hover:opacity-60 select-none transition-opacity">
                        {shortTime(msg.timestamp)}
                      </span>
                    </div>
                  )}

                  {/* Content column */}
                  <div className="flex-1 min-w-0">
                    {/* Author + timestamp header (non-compact only) */}
                    {!compact && (
                      <div className="flex items-baseline mb-0.5">
                        <span
                          className="text-label-large font-semibold mr-2 cursor-pointer hover:underline"
                          style={{ color: msg.author.roleColor || undefined }}
                        >
                          {msg.author.username}
                        </span>
                        <span className="text-label-small text-on-surface-variant/70">
                          {msg.timestamp}
                        </span>
                      </div>
                    )}

                    {/* Reply context */}
                    {msg.replyTo && (
                      <div className="flex items-center mb-1 ml-0.5">
                        <div className="w-0.5 h-full min-h-[20px] bg-primary rounded-full mr-2 shrink-0" />
                        <img
                          src={msg.replyTo.author.avatar}
                          alt=""
                          className="w-4 h-4 rounded-full mr-1.5 shrink-0"
                        />
                        <span
                          className="text-label-small font-semibold mr-1.5 shrink-0"
                          style={{ color: msg.replyTo.author.roleColor || undefined }}
                        >
                          {msg.replyTo.author.username}
                        </span>
                        <span className="text-label-small text-on-surface-variant truncate">
                          {msg.replyTo.content}
                        </span>
                      </div>
                    )}

                    {/* Message body */}
                    <div className="text-body-medium text-on-surface whitespace-pre-wrap leading-relaxed break-words">
                      {msg.content}
                      {msg.isEdited && (
                        <span className="text-label-small text-on-surface-variant/60 ml-1 select-none">
                          (edited)
                        </span>
                      )}
                    </div>

                    {/* Image attachments */}
                    {msg.attachments
                      ?.filter((a) => a.type === 'image')
                      .map((att, i) => (
                        <div
                          key={`img-${i}`}
                          className="mt-2 max-w-[400px] max-h-[300px] rounded-[12px] overflow-hidden cursor-pointer hover:brightness-110 transition-all border border-outline-variant/10"
                          onClick={() => att.url && onImageClick?.(att.url)}
                        >
                          <img
                            src={att.url || `https://placehold.co/400x300/1B5FA8/FFFFFF?text=${encodeURIComponent(att.name)}`}
                            alt={att.name}
                            className="w-full h-auto object-cover"
                            loading="lazy"
                          />
                        </div>
                      ))}

                    {/* File attachments */}
                    {msg.attachments
                      ?.filter((a) => a.type === 'file')
                      .map((att, i) => (
                        <div
                          key={`file-${i}`}
                          className="mt-2 max-w-[360px] flex items-center bg-surface-container rounded-[12px] border border-outline-variant/20 p-3 shadow-elevation-1"
                        >
                          <span className="material-symbols-outlined text-[32px] text-primary mr-3 shrink-0">
                            description
                          </span>
                          <div className="flex-1 min-w-0 mr-2">
                            <p className="text-label-medium font-semibold text-primary truncate">
                              {att.name}
                            </p>
                            <p className="text-label-small text-on-surface-variant">{att.size}</p>
                          </div>
                          <button className="p-1.5 hover:bg-surface-container-high rounded-full transition-colors shrink-0">
                            <span className="material-symbols-outlined text-[20px] text-on-surface-variant hover:text-primary">
                              download
                            </span>
                          </button>
                        </div>
                      ))}

                    {/* Embeds */}
                    {msg.embeds?.map((embed, i) => (
                      <div
                        key={`embed-${i}`}
                        className="mt-2 max-w-[420px] flex rounded-[8px] bg-surface-container border border-outline-variant/10 overflow-hidden shadow-elevation-1"
                      >
                        <div className="w-1 shrink-0" style={{ backgroundColor: embed.color }} />
                        <div className="flex-1 p-3 min-w-0">
                          {embed.siteName && (
                            <p className="text-label-small text-on-surface-variant mb-0.5">{embed.siteName}</p>
                          )}
                          <p
                            className="text-label-large font-semibold mb-1 cursor-pointer hover:underline"
                            style={{ color: embed.color }}
                          >
                            {embed.title}
                          </p>
                          <p className="text-body-small text-on-surface-variant leading-snug">
                            {embed.description}
                          </p>
                          {embed.image && (
                            <img
                              src={embed.image}
                              alt=""
                              className="mt-2 rounded-[8px] max-w-full h-auto"
                              loading="lazy"
                            />
                          )}
                        </div>
                        {embed.thumbnail && (
                          <img
                            src={embed.thumbnail}
                            alt=""
                            className="w-16 h-16 object-cover m-3 rounded-[8px] shrink-0"
                          />
                        )}
                      </div>
                    ))}

                    {/* Reactions */}
                    {reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {reactions.map((react, i) => (
                          <button
                            key={`${react.emoji}-${i}`}
                            onClick={() => toggleReaction(msg.id, i)}
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-small font-medium border transition-colors ${
                              react.me
                                ? 'bg-primary-container border-primary/40 text-on-primary-container'
                                : 'bg-transparent border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                            }`}
                          >
                            <span className="mr-1 text-sm">{react.emoji}</span>
                            {react.count}
                          </button>
                        ))}
                        <button className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-colors opacity-0 group-hover:opacity-100">
                          <span className="material-symbols-outlined text-[16px]">add_reaction</span>
                        </button>
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

      {/* ---------------------------------------------------------- */}
      {/*  Message Input Bar                                           */}
      {/* ---------------------------------------------------------- */}
      <div className="px-4 pt-2 pb-3 bg-surface z-20 shrink-0 relative">
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <EmojiPicker
            onSelect={(emoji) => insertEmoji(emoji)}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}

        <div className="flex items-end bg-surface-container-high rounded-[28px] px-2 py-1.5 shadow-elevation-1 focus-within:ring-2 focus-within:ring-primary/40 transition-all min-h-[48px]">
          {/* Left buttons */}
          <button
            className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-highest transition-colors shrink-0"
            title="Attach file"
          >
            <span className="material-symbols-outlined text-[22px]">add_circle</span>
          </button>
          <button
            className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-highest transition-colors shrink-0 hidden sm:flex items-center justify-center"
            title="GIF picker"
          >
            <span className="material-symbols-outlined text-[22px]">gif</span>
          </button>

          {/* Textarea */}
          <div className="flex-1 mx-1 py-1.5 min-w-0">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`Message #${channel.name}`}
              className="w-full bg-transparent border-none focus:outline-none text-body-medium text-on-surface placeholder:text-on-surface-variant/50 resize-none max-h-32 overflow-y-auto leading-snug"
              rows={1}
              style={{ minHeight: '24px' }}
            />
          </div>

          {/* Right buttons */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => setShowEmojiPicker((p) => !p)}
              className={`p-2 rounded-full transition-colors ${
                showEmojiPicker
                  ? 'text-primary bg-surface-container-highest'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-highest'
              }`}
              title="Emoji"
            >
              <span className="material-symbols-outlined text-[22px]">emoji_emotions</span>
            </button>

            {inputValue.trim() ? (
              <button
                onClick={handleSend}
                className="p-2 bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-all shadow-elevation-2 animate-scale-in ml-0.5"
                title="Send"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            ) : (
              <button
                className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-highest transition-colors"
                title="Voice message"
              >
                <span className="material-symbols-outlined text-[22px]">mic</span>
              </button>
            )}
          </div>
        </div>

        {/* Typing indicator */}
        <TypingIndicator visible={isTyping} />
      </div>
    </main>
  );
};
