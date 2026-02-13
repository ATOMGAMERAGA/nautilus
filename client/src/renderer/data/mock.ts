export interface User {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  activity?: string;
  roleColor?: string;
  discriminator: string;
  banner?: string;
  aboutMe?: string;
  roles?: string[];
  statusEmoji?: string;
}

export interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice' | 'announcement';
  categoryId?: string;
  unread?: boolean;
  mentionCount?: number;
  topic?: string;
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
  unread?: boolean;
  mentionCount?: number;
}

export interface Reaction {
  emoji: string;
  count: number;
  me: boolean;
}

export interface Attachment {
  name: string;
  size: string;
  type: 'image' | 'file';
  url?: string;
}

export interface Embed {
  title: string;
  description: string;
  color: string;
  image?: string;
  url?: string;
  siteName?: string;
  favicon?: string;
  thumbnail?: string;
}

export interface Message {
  id: string;
  content: string;
  author: User;
  timestamp: string;
  attachments?: Attachment[];
  reactions?: Reaction[];
  replyTo?: Message;
  embeds?: Embed[];
  isEdited?: boolean;
  isPinned?: boolean;
}

export interface DMConversation {
  id: string;
  user: User;
  lastMessage: string;
  lastMessageTime: string;
  unread?: boolean;
  unreadCount?: number;
}

export const CURRENT_USER: User = {
  id: 'me',
  username: 'NautilusUser',
  discriminator: '1337',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NautilusUser',
  status: 'online',
  roleColor: '#A8C8FF',
  aboutMe: 'Building the future of communication.',
  roles: ['Admin', 'Developer'],
  banner: 'https://placehold.co/600x200/004A8A/A8C8FF?text=+'
};

export const USERS: User[] = [
  CURRENT_USER,
  { id: 'u1', username: 'CaptainNemo', discriminator: '0001', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nemo', status: 'online', activity: 'Navigating the deep', roleColor: '#FFB4AB', aboutMe: 'Master of the Nautilus submarine.', roles: ['Admin', 'Captain'], statusEmoji: '🚢' },
  { id: 'u2', username: 'Aronnax', discriminator: '1869', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aronnax', status: 'idle', activity: 'Writing journals', roleColor: '#DDBCE0', aboutMe: 'Professor of marine biology.', roles: ['Moderator', 'Scholar'] },
  { id: 'u3', username: 'NedLand', discriminator: '5050', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ned', status: 'dnd', activity: 'Sharpening harpoon', roleColor: '#BEC6DC', aboutMe: 'Canadian harpooner extraordinaire.', roles: ['Member'] },
  { id: 'u4', username: 'Conseil', discriminator: '2024', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Conseil', status: 'offline', roleColor: '#E3E2E6', aboutMe: 'Faithful servant and taxonomist.', roles: ['Member'] },
  { id: 'u5', username: 'Cyrus', discriminator: '1010', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cyrus', status: 'online', roleColor: '#FFD8E4', activity: 'Playing Minecraft', aboutMe: 'Engineer and inventor.', roles: ['Developer'], statusEmoji: '🎮' },
  { id: 'u6', username: 'PencroftSail', discriminator: '4242', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pencroft', status: 'online', activity: 'Sailing the Pacific', roleColor: '#A8C8FF', roles: ['Member'] },
  { id: 'u7', username: 'GideonSpil', discriminator: '7777', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gideon', status: 'idle', roleColor: '#DDBCE0', activity: 'Listening to music', roles: ['Member'], statusEmoji: '🎵' },
  { id: 'u8', username: 'HerbertBrown', discriminator: '3030', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Herbert', status: 'online', roleColor: '#BEC6DC', activity: 'Studying botany', roles: ['Scholar'] },
  { id: 'u9', username: 'AyrtonnDeck', discriminator: '9090', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayrton', status: 'dnd', roleColor: '#FFB4AB', aboutMe: 'Redemption arc in progress.', roles: ['Member'] },
  { id: 'u10', username: 'TopNarwhale', discriminator: '1234', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Narwhale', status: 'offline', roleColor: '#E3E2E6', roles: ['Member'] },
  { id: 'u11', username: 'JulesVerne', discriminator: '1828', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JulesV', status: 'online', roleColor: '#FFD8E4', activity: 'Writing novels', roles: ['Admin', 'Author'], statusEmoji: '📖' },
  { id: 'u12', username: 'PhileasFogg', discriminator: '8080', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Phileas', status: 'idle', activity: 'Traveling the world', roleColor: '#A8C8FF', roles: ['Member'] },
  { id: 'u13', username: 'Passepartout', discriminator: '6060', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Passe', status: 'online', roleColor: '#DDBCE0', roles: ['Member'] },
  { id: 'u14', username: 'RoburConquor', discriminator: '2222', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robur', status: 'dnd', activity: 'Building flying machines', roleColor: '#BEC6DC', roles: ['Developer'] },
  { id: 'u15', username: 'CapHatteras', discriminator: '5555', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hatteras', status: 'offline', roleColor: '#FFB4AB', roles: ['Member'] },
  { id: 'u16', username: 'LincolnIsland', discriminator: '1865', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lincoln', status: 'online', roleColor: '#E3E2E6', activity: 'Exploring caves', roles: ['Member'] },
  { id: 'u17', username: 'MichelStrog', discriminator: '4444', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michel', status: 'online', roleColor: '#FFD8E4', roles: ['Moderator'] },
  { id: 'u18', username: 'DoctorOx', discriminator: '3333', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DoctorOx', status: 'idle', roleColor: '#A8C8FF', roles: ['Scholar'] },
  { id: 'u19', username: 'FixDetective', discriminator: '1111', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fix', status: 'offline', roleColor: '#DDBCE0', roles: ['Member'] },
  { id: 'u20', username: 'AquaNaut', discriminator: '0007', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AquaNaut', status: 'online', roleColor: '#BEC6DC', activity: 'Deep sea diving', roles: ['Member'], statusEmoji: '🐚' },
];

export const SERVERS: Server[] = [
  {
    id: 's1',
    name: 'Nautilus Official',
    icon: 'https://placehold.co/100x100/1B5FA8/FFFFFF?text=N',
    banner: 'https://placehold.co/600x200/111318/A8C8FF?text=Deep+Sea',
    unread: true,
    mentionCount: 3,
    categories: [
      {
        id: 'c1',
        name: 'Information',
        channels: [
          { id: 'ch1', name: 'announcements', type: 'announcement', categoryId: 'c1', topic: 'Official announcements and updates' },
          { id: 'ch2', name: 'rules', type: 'text', categoryId: 'c1', topic: 'Server rules - read before posting' },
          { id: 'ch2b', name: 'welcome', type: 'text', categoryId: 'c1', topic: 'Say hello to new members!' },
        ]
      },
      {
        id: 'c2',
        name: 'General',
        channels: [
          { id: 'ch3', name: 'general', type: 'text', categoryId: 'c2', unread: true, mentionCount: 2, topic: 'General discussion for the community' },
          { id: 'ch4', name: 'off-topic', type: 'text', categoryId: 'c2', topic: 'Anything goes!' },
          { id: 'ch5', name: 'memes', type: 'text', categoryId: 'c2', unread: true, topic: 'Share your best memes' },
          { id: 'ch5b', name: 'media', type: 'text', categoryId: 'c2', topic: 'Screenshots, art, and videos' },
        ]
      },
      {
        id: 'c3',
        name: 'Development',
        channels: [
          { id: 'ch6', name: 'dev-chat', type: 'text', categoryId: 'c3', topic: 'Development discussion' },
          { id: 'ch7', name: 'bug-reports', type: 'text', categoryId: 'c3', unread: true, mentionCount: 1, topic: 'Report bugs here' },
          { id: 'ch7b', name: 'feature-requests', type: 'text', categoryId: 'c3', topic: 'Suggest new features' },
        ]
      },
      {
        id: 'c4',
        name: 'Voice Channels',
        channels: [
          { id: 'vc1', name: 'Lounge', type: 'voice', categoryId: 'c4', connectedUsers: [USERS[1], USERS[2]] },
          { id: 'vc2', name: 'Gaming', type: 'voice', categoryId: 'c4', connectedUsers: [USERS[5]] },
          { id: 'vc3', name: 'Music', type: 'voice', categoryId: 'c4' },
        ]
      }
    ]
  },
  {
    id: 's2',
    name: 'React Developers',
    icon: 'https://placehold.co/100x100/61DAFB/000000?text=R',
    unread: true,
    categories: [
      {
        id: 'rc1',
        name: 'Information',
        channels: [
          { id: 'rch0', name: 'announcements', type: 'announcement', categoryId: 'rc1', topic: 'React ecosystem news' },
          { id: 'rch0b', name: 'resources', type: 'text', categoryId: 'rc1', topic: 'Helpful links and tutorials' },
        ]
      },
      {
        id: 'rc2',
        name: 'Discussion',
        channels: [
          { id: 'rch1', name: 'help-react', type: 'text', categoryId: 'rc2', unread: true, topic: 'Ask for help with React' },
          { id: 'rch2', name: 'showcase', type: 'text', categoryId: 'rc2', topic: 'Show off your projects' },
          { id: 'rch3', name: 'typescript', type: 'text', categoryId: 'rc2', topic: 'TypeScript questions' },
          { id: 'rch4', name: 'nextjs', type: 'text', categoryId: 'rc2', topic: 'Next.js discussion' },
          { id: 'rch5', name: 'state-management', type: 'text', categoryId: 'rc2', topic: 'Redux, Zustand, Jotai, etc.' },
        ]
      },
      {
        id: 'rc3',
        name: 'Voice',
        channels: [
          { id: 'rvc1', name: 'Code Review', type: 'voice', categoryId: 'rc3' },
          { id: 'rvc2', name: 'Pair Programming', type: 'voice', categoryId: 'rc3' },
        ]
      }
    ]
  },
  {
    id: 's3',
    name: 'Design System',
    icon: 'https://placehold.co/100x100/FF4081/FFFFFF?text=M3',
    categories: [
      {
        id: 'dc1',
        name: 'Material Design',
        channels: [
          { id: 'dch1', name: 'general', type: 'text', categoryId: 'dc1', topic: 'Material Design discussion' },
          { id: 'dch2', name: 'components', type: 'text', categoryId: 'dc1', topic: 'Component library talk' },
          { id: 'dch3', name: 'color-system', type: 'text', categoryId: 'dc1', topic: 'Dynamic color and theming' },
          { id: 'dch4', name: 'typography', type: 'text', categoryId: 'dc1', topic: 'Font scales and text styles' },
          { id: 'dch5', name: 'motion', type: 'text', categoryId: 'dc1', topic: 'Animation and transitions' },
        ]
      },
      {
        id: 'dc2',
        name: 'Showcase',
        channels: [
          { id: 'dch6', name: 'designs', type: 'text', categoryId: 'dc2', topic: 'Share your designs' },
          { id: 'dch7', name: 'feedback', type: 'text', categoryId: 'dc2', topic: 'Get feedback on your work' },
        ]
      },
      {
        id: 'dc3',
        name: 'Voice',
        channels: [
          { id: 'dvc1', name: 'Design Review', type: 'voice', categoryId: 'dc3' },
        ]
      }
    ]
  },
  {
    id: 's4',
    name: 'Gaming Hub',
    icon: 'https://placehold.co/100x100/4CAF50/FFFFFF?text=G',
    mentionCount: 5,
    categories: [
      {
        id: 'gc1',
        name: 'General',
        channels: [
          { id: 'gch1', name: 'lobby', type: 'text', categoryId: 'gc1', topic: 'Main chat for gamers' },
          { id: 'gch2', name: 'looking-for-group', type: 'text', categoryId: 'gc1', unread: true, topic: 'Find teammates' },
          { id: 'gch3', name: 'clips', type: 'text', categoryId: 'gc1', topic: 'Share your best moments' },
        ]
      },
      {
        id: 'gc2',
        name: 'Games',
        channels: [
          { id: 'gch4', name: 'minecraft', type: 'text', categoryId: 'gc2', topic: 'Minecraft discussion' },
          { id: 'gch5', name: 'valorant', type: 'text', categoryId: 'gc2', topic: 'Valorant discussion' },
          { id: 'gch6', name: 'cs2', type: 'text', categoryId: 'gc2', topic: 'Counter-Strike 2' },
          { id: 'gch7', name: 'league', type: 'text', categoryId: 'gc2', topic: 'League of Legends' },
        ]
      },
      {
        id: 'gc3',
        name: 'Voice',
        channels: [
          { id: 'gvc1', name: 'Game Night', type: 'voice', categoryId: 'gc3', connectedUsers: [USERS[5], USERS[8], USERS[11]] },
          { id: 'gvc2', name: 'Chill', type: 'voice', categoryId: 'gc3' },
        ]
      }
    ]
  },
  {
    id: 's5',
    name: 'Music Lounge',
    icon: 'https://placehold.co/100x100/9C27B0/FFFFFF?text=%E2%99%AA',
    categories: [
      {
        id: 'mc1',
        name: 'Chat',
        channels: [
          { id: 'mch1', name: 'general', type: 'text', categoryId: 'mc1', topic: 'Music discussion' },
          { id: 'mch2', name: 'recommendations', type: 'text', categoryId: 'mc1', topic: 'Share what you\'re listening to' },
          { id: 'mch3', name: 'production', type: 'text', categoryId: 'mc1', topic: 'Music production tips' },
          { id: 'mch4', name: 'vinyl-corner', type: 'text', categoryId: 'mc1', topic: 'For vinyl collectors' },
          { id: 'mch5', name: 'concert-talk', type: 'text', categoryId: 'mc1', topic: 'Live music discussion' },
        ]
      },
      {
        id: 'mc2',
        name: 'Listening Sessions',
        channels: [
          { id: 'mvc1', name: 'Lo-Fi Beats', type: 'voice', categoryId: 'mc2', connectedUsers: [USERS[7]] },
          { id: 'mvc2', name: 'DJ Booth', type: 'voice', categoryId: 'mc2' },
          { id: 'mvc3', name: 'Jam Session', type: 'voice', categoryId: 'mc2' },
        ]
      }
    ]
  }
];

export const MESSAGES: Message[] = [
  {
    id: 'm1',
    content: 'Welcome to the Nautilus server! This is a test message to show off the UI. Feel free to explore all the features.',
    author: USERS[1],
    timestamp: 'Today at 9:00 AM',
    reactions: [{ emoji: '👋', count: 8, me: true }, { emoji: '🎉', count: 5, me: false }, { emoji: '❤️', count: 3, me: true }],
    isPinned: true
  },
  {
    id: 'm2',
    content: 'The depth here is amazing. 20,000 leagues under the sea! I\'ve been documenting everything in my journal.',
    author: USERS[2],
    timestamp: 'Today at 9:02 AM',
  },
  {
    id: 'm3',
    content: 'Has anyone checked out the new Material Design 3 guidelines? The dynamic color system is incredible.',
    author: USERS[5],
    timestamp: 'Today at 9:05 AM',
    reactions: [{ emoji: '👍', count: 4, me: false }]
  },
  {
    id: 'm4',
    content: 'I found a giant squid. Anyone want to help me catch it?',
    author: USERS[3],
    timestamp: 'Today at 9:10 AM',
    attachments: [{ name: 'squid_sighting.png', size: '2.4 MB', type: 'image', url: 'https://placehold.co/400x300/1B5FA8/FFFFFF?text=Giant+Squid' }]
  },
  {
    id: 'm5',
    content: 'Please do not harm the marine life, Mr. Land. We are here to observe, not to hunt.',
    author: USERS[1],
    timestamp: 'Today at 9:11 AM',
    replyTo: {
      id: 'm4',
      content: 'I found a giant squid. Anyone want to help me catch it?',
      author: USERS[3],
      timestamp: 'Today at 9:10 AM'
    }
  },
  {
    id: 'm6',
    content: 'According to my classifications, the specimen belongs to the genus Architeuthis.',
    author: USERS[4],
    timestamp: 'Today at 9:12 AM',
  },
  {
    id: 'm7',
    content: 'Conseil, always with the classifications! 😄',
    author: USERS[2],
    timestamp: 'Today at 9:12 AM',
    reactions: [{ emoji: '😂', count: 6, me: true }]
  },
  {
    id: 'm8',
    content: 'Check out this cool design resource I found.',
    author: USERS[5],
    timestamp: 'Today at 9:30 AM',
    embeds: [{
      title: 'Material Design 3',
      description: 'Material 3 is the latest version of Google\'s open-source design system. Design and build beautiful, usable products with M3.',
      color: '#1B5FA8',
      siteName: 'material.io',
      url: 'https://m3.material.io'
    }]
  },
  {
    id: 'm9',
    content: 'The pressure at this depth is incredible. Our instruments are reading over 200 atmospheres.',
    author: USERS[1],
    timestamp: 'Today at 9:45 AM',
  },
  {
    id: 'm10',
    content: 'I\'ve been working on optimizing the submarine\'s reactor. Here are the latest efficiency numbers:',
    author: USERS[5],
    timestamp: 'Today at 9:46 AM',
  },
  {
    id: 'm11',
    content: '```\nReactor Output: 98.7%\nFuel Efficiency: 94.2%\nCooling System: Nominal\nEstimated Range: 45,000 nautical miles\n```',
    author: USERS[5],
    timestamp: 'Today at 9:46 AM',
  },
  {
    id: 'm12',
    content: 'Impressive work, Cyrus! Those numbers are better than expected.',
    author: USERS[1],
    timestamp: 'Today at 9:48 AM',
    reactions: [{ emoji: '🔥', count: 3, me: false }, { emoji: '💯', count: 2, me: false }]
  },
  {
    id: 'm13',
    content: 'We just passed by a beautiful coral reef. The bioluminescence is breathtaking.',
    author: USERS[6],
    timestamp: 'Today at 10:00 AM',
    attachments: [{ name: 'coral_reef.jpg', size: '3.8 MB', type: 'image', url: 'https://placehold.co/400x250/004A8A/DDBCE0?text=Coral+Reef' }]
  },
  {
    id: 'm14',
    content: 'Nature\'s light show never gets old. I could watch this for hours.',
    author: USERS[7],
    timestamp: 'Today at 10:02 AM',
  },
  {
    id: 'm15',
    content: 'The deep sea is home to over 2,000 known species of bioluminescent organisms.',
    author: USERS[8],
    timestamp: 'Today at 10:05 AM',
  },
  {
    id: 'm16',
    content: 'I\'m detecting some interesting sonar signatures ahead. Could be an underwater cave system.',
    author: USERS[11],
    timestamp: 'Today at 10:15 AM',
    reactions: [{ emoji: '👀', count: 5, me: false }]
  },
  {
    id: 'm17',
    content: 'Should we investigate? Cave systems can be dangerous at these depths.',
    author: USERS[2],
    timestamp: 'Today at 10:16 AM',
    replyTo: {
      id: 'm16',
      content: 'I\'m detecting some interesting sonar signatures ahead...',
      author: USERS[11],
      timestamp: 'Today at 10:15 AM'
    }
  },
  {
    id: 'm18',
    content: 'I say we go for it. Nothing ventured, nothing gained!',
    author: USERS[3],
    timestamp: 'Today at 10:17 AM',
  },
  {
    id: 'm19',
    content: 'Let\'s proceed with caution. Cyrus, run a structural analysis on the hull integrity.',
    author: USERS[1],
    timestamp: 'Today at 10:18 AM',
  },
  {
    id: 'm20',
    content: 'Hull integrity at 99.8%. We\'re good to go, Captain.',
    author: USERS[5],
    timestamp: 'Today at 10:20 AM',
    reactions: [{ emoji: '✅', count: 4, me: true }]
  },
  {
    id: 'm21',
    content: 'Just discovered a new species of deep-sea jellyfish! I\'m naming it *Aurelia nautilis*.',
    author: USERS[8],
    timestamp: 'Today at 10:30 AM',
    attachments: [{ name: 'new_jellyfish.png', size: '1.8 MB', type: 'image', url: 'https://placehold.co/350x280/9C27B0/FFFFFF?text=Jellyfish' }],
    reactions: [{ emoji: '🪼', count: 7, me: true }, { emoji: '🔬', count: 3, me: false }]
  },
  {
    id: 'm22',
    content: 'That\'s beautiful! The tentacles have an incredible iridescent quality.',
    author: USERS[13],
    timestamp: 'Today at 10:32 AM',
  },
  {
    id: 'm23',
    content: 'We should document this properly for the Marine Biology Institute.',
    author: USERS[2],
    timestamp: 'Today at 10:33 AM',
  },
  {
    id: 'm24',
    content: 'Already on it, Professor. I\'m compiling the full taxonomic record.',
    author: USERS[4],
    timestamp: 'Today at 10:33 AM',
  },
  {
    id: 'm25',
    content: 'Just finished my shift at the helm. That underwater canyon was something else!',
    author: USERS[16],
    timestamp: 'Today at 10:45 AM',
  },
  {
    id: 'm26',
    content: 'The acoustic readings from that canyon were fascinating. There were echoes suggesting it\'s over 5km deep.',
    author: USERS[17],
    timestamp: 'Today at 10:47 AM',
  },
  {
    id: 'm27',
    content: 'I\'ve been analyzing the water samples from earlier. The mineral content is unusual.',
    author: USERS[18],
    timestamp: 'Today at 11:00 AM',
    attachments: [{ name: 'water_analysis.pdf', size: '450 KB', type: 'file' }]
  },
  {
    id: 'm28',
    content: 'Unusual how? Higher concentrations of rare earth elements?',
    author: USERS[5],
    timestamp: 'Today at 11:01 AM',
    replyTo: {
      id: 'm27',
      content: 'I\'ve been analyzing the water samples from earlier...',
      author: USERS[18],
      timestamp: 'Today at 11:00 AM'
    }
  },
  {
    id: 'm29',
    content: 'Exactly. There\'s an elevated level of lithium and cobalt. Could indicate hydrothermal vents nearby.',
    author: USERS[18],
    timestamp: 'Today at 11:02 AM',
  },
  {
    id: 'm30',
    content: 'Hydrothermal vents! That would be an incredible find at this depth.',
    author: USERS[11],
    timestamp: 'Today at 11:03 AM',
    reactions: [{ emoji: '🌋', count: 4, me: false }]
  },
  {
    id: 'm31',
    content: 'Setting a course for the area with the highest mineral concentration. ETA 2 hours.',
    author: USERS[1],
    timestamp: 'Today at 11:05 AM',
  },
  {
    id: 'm32',
    content: 'Meanwhile, here\'s a snack for everyone in the mess hall 🍕',
    author: USERS[6],
    timestamp: 'Today at 11:10 AM',
    reactions: [{ emoji: '🍕', count: 12, me: true }, { emoji: '😋', count: 6, me: false }]
  },
  {
    id: 'm33',
    content: 'Finally, some real food! Those ration packs were getting old.',
    author: USERS[3],
    timestamp: 'Today at 11:11 AM',
  },
  {
    id: 'm34',
    content: 'The galley has been stocked with fresh supplies from the last port.',
    author: USERS[1],
    timestamp: 'Today at 11:12 AM',
  },
  {
    id: 'm35',
    content: 'Has anyone seen the sunset from observation deck B? It\'s gorgeous through the periscope.',
    author: USERS[12],
    timestamp: 'Today at 11:20 AM',
  },
  {
    id: 'm36',
    content: 'We\'re 500 meters below the surface, Passepartout. There are no sunsets down here.',
    author: USERS[14],
    timestamp: 'Today at 11:21 AM',
    reactions: [{ emoji: '😂', count: 9, me: true }]
  },
  {
    id: 'm37',
    content: 'The exterior lights create their own kind of sunset against the water particles. It is beautiful.',
    author: USERS[7],
    timestamp: 'Today at 11:22 AM',
  },
  {
    id: 'm38',
    content: 'Temperature sensor update: external water temp is 2.3°C. Internal: 22°C. Life support nominal.',
    author: USERS[5],
    timestamp: 'Today at 11:30 AM',
  },
  {
    id: 'm39',
    content: '**Attention all crew:** We\'re approaching the underwater cave system. All hands to stations.',
    author: USERS[1],
    timestamp: 'Today at 11:45 AM',
    isPinned: true,
    reactions: [{ emoji: '⚓', count: 15, me: true }]
  },
  {
    id: 'm40',
    content: 'Ready at navigation. Sonar arrays are fully operational.',
    author: USERS[11],
    timestamp: 'Today at 11:46 AM',
  },
  {
    id: 'm41',
    content: 'Weapons systems on standby. Just in case.',
    author: USERS[3],
    timestamp: 'Today at 11:46 AM',
  },
  {
    id: 'm42',
    content: 'Medical bay is prepared for any contingencies.',
    author: USERS[18],
    timestamp: 'Today at 11:46 AM',
  },
  {
    id: 'm43',
    content: 'Engineering reports all systems green. Ballast tanks ready for rapid adjustment.',
    author: USERS[5],
    timestamp: 'Today at 11:47 AM',
  },
  {
    id: 'm44',
    content: 'Entering the cave system now. Visibility is... limited. Switching to sonar-guided navigation.',
    author: USERS[1],
    timestamp: 'Today at 11:50 AM',
  },
  {
    id: 'm45',
    content: 'The acoustic signature suggests a massive chamber ahead. This could be extraordinary.',
    author: USERS[17],
    timestamp: 'Today at 11:52 AM',
    reactions: [{ emoji: '🤩', count: 6, me: false }]
  },
  {
    id: 'm46',
    content: 'I\'m getting readings of bioluminescent organisms covering the cave walls. It\'s like a starfield!',
    author: USERS[8],
    timestamp: 'Today at 11:55 AM',
    attachments: [{ name: 'cave_bioluminescence.jpg', size: '5.2 MB', type: 'image', url: 'https://placehold.co/450x300/111318/A8C8FF?text=Cave+Lights' }],
    reactions: [{ emoji: '✨', count: 11, me: true }, { emoji: '🌟', count: 8, me: false }]
  },
  {
    id: 'm47',
    content: 'This is why we explore. Moments like this make it all worthwhile.',
    author: USERS[2],
    timestamp: 'Today at 11:56 AM',
  },
  {
    id: 'm48',
    content: 'Agreed. I\'m adding this location to our chart as "Nautilus Grotto."',
    author: USERS[1],
    timestamp: 'Today at 11:57 AM',
    reactions: [{ emoji: '🗺️', count: 7, me: true }]
  },
  {
    id: 'm49',
    content: 'Has anyone tried the new messaging features? The emoji picker is fantastic!',
    author: USERS[20],
    timestamp: 'Today at 12:00 PM',
    isEdited: true
  },
  {
    id: 'm50',
    content: 'The voice channels are crystal clear too. Great work on the audio codecs, engineering team!',
    author: USERS[16],
    timestamp: 'Today at 12:05 PM',
    reactions: [{ emoji: '🎧', count: 4, me: false }, { emoji: '👏', count: 6, me: true }]
  },
  {
    id: 'm51',
    content: 'Just merged my latest PR for the UI improvements. Check it out in #dev-chat!',
    author: USERS[5],
    timestamp: 'Today at 12:10 PM',
    embeds: [{
      title: 'PR #142: Material Design 3 UI Overhaul',
      description: 'Complete redesign of the chat interface with M3 components, dynamic theming, and responsive layouts.',
      color: '#4CAF50',
      siteName: 'GitHub',
    }]
  },
  {
    id: 'm52',
    content: 'Looking great! The ripple effects on the buttons are a nice touch.',
    author: USERS[11],
    timestamp: 'Today at 12:12 PM',
  },
  {
    id: 'm53',
    content: 'We should do a design review session in the voice channel later. Who\'s in?',
    author: USERS[7],
    timestamp: 'Today at 12:15 PM',
    reactions: [{ emoji: '🙋', count: 8, me: true }, { emoji: '👍', count: 5, me: false }]
  },
];

export const DM_CONVERSATIONS: DMConversation[] = [
  { id: 'dm1', user: USERS[1], lastMessage: 'See you at the bridge tomorrow.', lastMessageTime: '2m ago', unread: true, unreadCount: 2 },
  { id: 'dm2', user: USERS[5], lastMessage: 'The reactor efficiency is looking great!', lastMessageTime: '15m ago', unread: true, unreadCount: 1 },
  { id: 'dm3', user: USERS[2], lastMessage: 'I\'ll send you my journal notes.', lastMessageTime: '1h ago' },
  { id: 'dm4', user: USERS[11], lastMessage: 'Good night, Captain.', lastMessageTime: '3h ago' },
  { id: 'dm5', user: USERS[8], lastMessage: 'The botanical samples are ready.', lastMessageTime: '5h ago' },
  { id: 'dm6', user: USERS[3], lastMessage: 'When\'s the next shore leave?', lastMessageTime: '1d ago' },
  { id: 'dm7', user: USERS[7], lastMessage: 'That melody was beautiful!', lastMessageTime: '2d ago' },
];

export const EMOJI_CATEGORIES = [
  { name: 'Recent', emojis: ['👋', '😂', '❤️', '🔥', '👍', '🎉', '✅', '🤩'] },
  { name: 'Smileys', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🫡', '🤐', '🤨', '😐', '😑', '😶'] },
  { name: 'People', emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '🫱', '🫲', '🫳', '🫴', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '🫵', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '🫶'] },
  { name: 'Nature', emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞'] },
  { name: 'Food', emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🧀', '🍕', '🍔', '🍟'] },
  { name: 'Activities', emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷'] },
  { name: 'Travel', emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🛵', '🏍️', '🛺', '🚲', '🛴', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '✈️', '🚀', '🛸', '🚁', '🛶', '⛵', '🚢'] },
  { name: 'Objects', emojis: ['⌚', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️'] },
  { name: 'Symbols', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '⭐', '🌟', '✨', '⚡', '🔥', '💫', '☀️', '🌈', '☮️', '✝️', '☪️', '🕉️', '☸️'] },
];
