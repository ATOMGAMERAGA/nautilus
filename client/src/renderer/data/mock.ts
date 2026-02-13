export interface User {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  activity?: string;
  roleColor?: string;
  discriminator: string;
}

export interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  categoryId?: string;
  unread?: boolean;
  connectedUsers?: User[];
}

export interface Category {
  id: string;
  name: string;
  channels: Channel[];
}

export interface Server {
  id: string;
  name: string;
  icon: string;
  banner?: string;
  categories: Category[];
}

export interface Message {
  id: string;
  content: string;
  author: User;
  timestamp: string;
  attachments?: { name: string; size: string; type: 'image' | 'file'; url?: string }[];
  reactions?: { emoji: string; count: number; me: boolean }[];
  replyTo?: Message;
  embeds?: { title: string; description: string; color: string; image?: string }[];
  isEdited?: boolean;
}

export const CURRENT_USER: User = {
  id: 'me',
  username: 'NautilusUser',
  discriminator: '1337',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NautilusUser',
  status: 'online',
  roleColor: '#A8C8FF'
};

export const USERS: User[] = [
  CURRENT_USER,
  { id: 'u1', username: 'CaptainNemo', discriminator: '0001', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nemo', status: 'online', activity: 'Navigating the deep', roleColor: '#FFB4AB' },
  { id: 'u2', username: 'Aronnax', discriminator: '1869', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aronnax', status: 'idle', activity: 'Writing journals', roleColor: '#DDBCE0' },
  { id: 'u3', username: 'NedLand', discriminator: '5050', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ned', status: 'dnd', activity: 'Sharpening harpoon', roleColor: '#BEC6DC' },
  { id: 'u4', username: 'Conseil', discriminator: '2024', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Conseil', status: 'offline', roleColor: '#E3E2E6' },
  { id: 'u5', username: 'Cyrus', discriminator: '1010', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cyrus', status: 'online', roleColor: '#FFD8E4' },
];

export const SERVERS: Server[] = [
  {
    id: 's1',
    name: 'Nautilus Official',
    icon: 'https://placehold.co/100x100/1B5FA8/FFFFFF?text=N',
    banner: 'https://placehold.co/600x200/111318/A8C8FF?text=Deep+Sea',
    categories: [
      {
        id: 'c1',
        name: 'Information',
        channels: [
          { id: 'ch1', name: 'announcements', type: 'text', categoryId: 'c1' },
          { id: 'ch2', name: 'rules', type: 'text', categoryId: 'c1' },
        ]
      },
      {
        id: 'c2',
        name: 'General',
        channels: [
          { id: 'ch3', name: 'general', type: 'text', categoryId: 'c2', unread: true },
          { id: 'ch4', name: 'off-topic', type: 'text', categoryId: 'c2' },
          { id: 'ch5', name: 'memes', type: 'text', categoryId: 'c2' },
        ]
      },
      {
        id: 'c3',
        name: 'Voice Channels',
        channels: [
          { id: 'vc1', name: 'Lounge', type: 'voice', categoryId: 'c3', connectedUsers: [USERS[1], USERS[2]] },
          { id: 'vc2', name: 'Gaming', type: 'voice', categoryId: 'c3' },
        ]
      }
    ]
  },
  {
    id: 's2',
    name: 'React Developers',
    icon: 'https://placehold.co/100x100/61DAFB/000000?text=React',
    categories: [
      {
        id: 'rc1',
        name: 'Discussion',
        channels: [
          { id: 'rch1', name: 'help-react', type: 'text', categoryId: 'rc1' },
          { id: 'rch2', name: 'showcase', type: 'text', categoryId: 'rc1' },
        ]
      }
    ]
  },
  {
    id: 's3',
    name: 'Design System',
    icon: 'https://placehold.co/100x100/FF4081/FFFFFF?text=M3',
    categories: []
  },
  {
    id: 's4',
    name: 'Gaming Hub',
    icon: 'https://placehold.co/100x100/4CAF50/FFFFFF?text=G',
    categories: []
  },
  {
    id: 's5',
    name: 'Music Lounge',
    icon: 'https://placehold.co/100x100/9C27B0/FFFFFF?text=♪',
    categories: []
  }
];

export const MESSAGES: Message[] = [
  {
    id: 'm1',
    content: 'Welcome to the Nautilus server! This is a test message to show off the UI.',
    author: USERS[1],
    timestamp: 'Today at 10:30 AM',
    reactions: [{ emoji: '👋', count: 3, me: true }]
  },
  {
    id: 'm2',
    content: 'The depth here is amazing. 20,000 leagues under the sea!',
    author: USERS[2],
    timestamp: 'Today at 10:31 AM',
  },
  {
    id: 'm3',
    content: 'I found a giant squid. Anyone want to help me catch it?',
    author: USERS[3],
    timestamp: 'Today at 10:35 AM',
    attachments: [{ name: 'squid_sighting.png', size: '2.4 MB', type: 'image' }]
  },
  {
    id: 'm4',
    content: 'Please do not harm the marine life, Mr. Land.',
    author: USERS[1],
    timestamp: 'Today at 10:36 AM',
    replyTo: {
      id: 'm3',
      content: 'I found a giant squid...',
      author: USERS[3],
      timestamp: 'Today at 10:35 AM'
    }
  },
  {
    id: 'm5',
    content: 'Check out this cool design resource I found.',
    author: USERS[4],
    timestamp: 'Today at 11:00 AM',
    embeds: [{
      title: 'Material Design 3',
      description: 'Material 3 is the latest version of Google’s open-source design system.',
      color: '#1B5FA8',
      image: 'https://lh3.googleusercontent.com/1-qF11rV1-m1-1-1-1-1-1-1-1-1-1-1-1-1-1-1' 
    }]
  },
  {
    id: 'm6',
    content: 'Has anyone seen the new update?',
    author: CURRENT_USER,
    timestamp: 'Today at 11:05 AM',
    isEdited: true
  }
];
