import React, { useState } from 'react';
import type { User } from '../../data/mock';

interface MemberSidebarProps {
  users: User[];
  isOpen: boolean;
  onCloseMobile?: () => void;
}

interface ProfilePopoutProps {
  user: User;
  onClose: () => void;
}

const ProfilePopout: React.FC<ProfilePopoutProps> = ({ user, onClose }) => {
  const [note, setNote] = useState('');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center md:absolute md:inset-auto md:right-full md:top-0 md:mr-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 md:hidden backdrop-blur-sm" />
      <div
        className="relative w-[320px] max-w-[90vw] bg-surface-container rounded-[28px] shadow-elevation-3 overflow-hidden animate-scale-in border border-outline-variant/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner */}
        <div className="h-24 bg-primary-container relative">
          {user.banner && (
            <img src={user.banner} alt="" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Avatar */}
        <div className="px-4 -mt-10 relative z-10">
          <div className="relative inline-block">
            <img
              src={user.avatar}
              alt={user.username}
              className="w-20 h-20 rounded-full border-4 border-surface-container shadow-elevation-1"
            />
            <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-[3px] border-surface-container ${
              user.status === 'online' ? 'bg-green-500' :
              user.status === 'idle' ? 'bg-yellow-500' :
              user.status === 'dnd' ? 'bg-red-500' :
              'bg-gray-500'
            }`} />
          </div>
        </div>

        {/* Info */}
        <div className="px-5 pt-3 pb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-headline-small font-bold" style={{ color: user.roleColor }}>
              {user.username}
            </h3>
            {user.statusEmoji && <span className="text-xl">{user.statusEmoji}</span>}
          </div>
          <div className="text-body-medium text-on-surface-variant">
            {user.username}#{user.discriminator}
          </div>
        </div>

        <div className="m3-divider" />

        <div className="px-5 py-4 space-y-4 max-h-[300px] overflow-y-auto thin-scrollbar">
          {/* About Me */}
          {user.aboutMe && (
            <div>
              <h4 className="text-label-small font-bold text-primary uppercase tracking-widest mb-1.5">About Me</h4>
              <p className="text-body-medium text-on-surface">{user.aboutMe}</p>
            </div>
          )}

          {/* Roles */}
          {user.roles && user.roles.length > 0 && (
            <div>
              <h4 className="text-label-small font-bold text-primary uppercase tracking-widest mb-2">Roles</h4>
              <div className="flex flex-wrap gap-1.5">
                {user.roles.map(role => (
                  <span
                    key={role}
                    className="inline-flex items-center px-3 py-1 rounded-full text-label-medium bg-secondary-container text-on-secondary-container border border-outline-variant/20"
                  >
                    <span className="w-2 h-2 rounded-full mr-2" style={{ background: user.roleColor || '#8E9099' }} />
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Note */}
          <div>
            <h4 className="text-label-small font-bold text-primary uppercase tracking-widest mb-2">Note</h4>
            <div className="m3-text-field">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Click to add a note"
                className="w-full bg-surface-container-highest rounded-[12px] px-3 py-2 text-body-small text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-5 py-4 bg-surface-container-low flex gap-2">
          <button className="flex-1 m3-button-filled !h-11">
            Message
          </button>
          <button className="m3-button-tonal !h-11 !px-4">
            <span className="material-symbols-outlined">person_add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const statusOrder: Record<string, number> = { online: 0, idle: 1, dnd: 2, offline: 3 };

export const MemberSidebar: React.FC<MemberSidebarProps> = ({
  users,
  isOpen,
  onCloseMobile
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const onlineUsers = users.filter(u => u.status !== 'offline').sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  const offlineUsers = users.filter(u => u.status === 'offline');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const renderUser = (user: User) => (
    <div key={user.id} className="px-2 mb-1">
      <div
        className={`flex items-center h-14 px-3 rounded-full cursor-pointer group transition-all duration-200 state-layer relative
          ${user.status === 'offline' ? 'opacity-60' : ''}
          hover:bg-on-surface/[0.08]
        `}
        onClick={() => setSelectedUser(user)}
        role="button"
      >
        <div className="relative flex-shrink-0">
          <img
            src={user.avatar}
            alt={user.username}
            className={`w-10 h-10 rounded-full ${user.status === 'offline' ? 'grayscale' : ''} border border-outline-variant/10`}
          />
          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface-container-low ${getStatusColor(user.status)}`} />
        </div>
        <div className="ml-3 overflow-hidden flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className="text-label-large font-bold truncate"
              style={{ color: user.status !== 'offline' ? (user.roleColor || 'inherit') : undefined }}
            >
              {user.username}
            </span>
            {user.statusEmoji && <span className="text-sm flex-shrink-0">{user.statusEmoji}</span>}
          </div>
          {user.activity && user.status !== 'offline' && (
            <div className="text-body-small text-on-surface-variant truncate">
              {user.activity}
            </div>
          )}
        </div>

        {/* Profile popout */}
        {selectedUser?.id === user.id && (
          <ProfilePopout user={user} onClose={() => setSelectedUser(null)} />
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onCloseMobile && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden animate-fade-in backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed inset-y-0 right-0 w-[280px] bg-surface-container-low flex flex-col border-l border-outline-variant/10
        transform transition-transform duration-300 ease-emphasized z-40
        md:relative md:w-64 md:translate-x-0 md:flex-shrink-0
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        ${!isOpen ? 'hidden md:flex' : 'flex'}
      `}>
        {/* Header */}
        <div className="h-16 px-6 flex items-center justify-between flex-shrink-0">
          <span className="text-label-large font-bold text-on-surface-variant uppercase tracking-widest">
            Members — {users.length}
          </span>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-2 rounded-full hover:bg-on-surface/[0.08] md:hidden transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-2 space-y-6 thin-scrollbar">
          {/* Online Group */}
          {onlineUsers.length > 0 && (
            <div>
              <div className="px-6 mb-2 text-label-small font-bold text-primary uppercase tracking-widest">
                Online — {onlineUsers.length}
              </div>
              {onlineUsers.map(renderUser)}
            </div>
          )}

          {/* Offline Group */}
          {offlineUsers.length > 0 && (
            <div>
              <div className="px-6 mb-2 text-label-small font-bold text-on-surface-variant uppercase tracking-widest">
                Offline — {offlineUsers.length}
              </div>
              {offlineUsers.map(renderUser)}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
