import { create } from 'zustand';
import { api } from '../services/api';

interface Channel {
  id: string;
  name: string;
  type: string;
  guild_id: string;
}

interface Guild {
  id: string;
  name: string;
  icon_url: string | null;
  channels: Channel[];
  owner_id?: string;
}

interface Message {
  id: string;
  content: string;
  author_id: string;
  channel_id: string;
  created_at: string;
  users: {
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
  attachments?: any[];
  url_embeds?: any[];
}

interface VoiceStream {
  userId: string;
  stream: MediaStream;
  displayName: string;
  isLocal?: boolean;
}

interface ChatState {
  guilds: Guild[];
  currentGuild: Guild | null;
  currentChannel: Channel | null;
  messages: Message[];
  isLoading: boolean;
  activeVoiceStreams: VoiceStream[];

  fetchGuilds: () => Promise<void>;
  selectGuild: (guildId: string) => void;
  selectChannel: (channel: Channel) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  addMessage: (message: Message) => void;
  addVoiceStream: (stream: VoiceStream) => void;
  removeVoiceStream: (userId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  guilds: [],
  currentGuild: null,
  currentChannel: null,
  messages: [],
  isLoading: false,
  activeVoiceStreams: [],

  fetchGuilds: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/guilds');
      set({ guilds: res.data });
      if (res.data.length > 0 && !get().currentGuild) {
        set({ currentGuild: res.data[0] });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  selectGuild: (guildId) => {
    const guild = get().guilds.find(g => g.id === guildId) || null;
    set({ currentGuild: guild, currentChannel: null, messages: [] });
  },

  selectChannel: async (channel) => {
    set({ currentChannel: channel, isLoading: true });
    if (channel.type === 'text') {
      try {
        const res = await api.get(`/channels/${channel.id}/messages`);
        set({ messages: res.data });
      } finally {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  sendMessage: async (content) => {
    const channel = get().currentChannel;
    if (!channel) return;
    const res = await api.post(`/channels/${channel.id}/messages`, { content });
    set((state) => ({ messages: [...state.messages, res.data] }));
  },

  addMessage: (message) => {
    if (message.channel_id === get().currentChannel?.id) {
      set((state) => ({ messages: [...state.messages, message] }));
    }
  },

  addVoiceStream: (stream) => {
    set((state) => ({
      activeVoiceStreams: [...state.activeVoiceStreams.filter(s => s.userId !== stream.userId), stream]
    }));
  },

  removeVoiceStream: (userId) => {
    set((state) => ({
      activeVoiceStreams: state.activeVoiceStreams.filter(s => s.userId !== userId)
    }));
  }
}));