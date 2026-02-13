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
    <div className="fixed inset-0 z-[60] flex items-center justify-center md:absolute md:inset-auto md:right-full md:top-0 md:mr-2" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 md:hidden" />
      <div
        className="relative w-[340px] max-w-[90vw] bg-surface-container-high rounded-[16px] shadow-elevation-4 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner */}
        <div className="h-16 bg-gradient-to-r from-primary-container to-tertiary-container relative">
          {user.banner && (
            <img src={user.banner} alt="" className="w-full h-full object-cover absolute inset-0" />
          )}
        </div>

        {/* Avatar */}
        <div className="px-4 -mt-8 relative z-10">
          <div className="relative inline-block">
            <img
              src={user.avatar}
              alt={user.username}
              className="w-16 h-16 rounded-full border-4 border-surface-container-high"
            />
            <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-[3px] border-surface-container-high ${
              user.status === 'online' ? 'bg-green-500' :
              user.status === 'idle' ? 'bg-yellow-500' :
              user.status === 'dnd' ? 'bg-red-500' :
              'bg-gray-500'
            }`} />
          </div>
        </div>

        {/* Info */}
        <div className="px-4 pt-2 pb-3">
          <div className="flex items-center gap-1.5">
            <h3 className="text-title-medium font-bold" style={{ color: user.roleColor }}>
              {user.username}
            </h3>
            {user.statusEmoji && <span className="text-sm">{user.statusEmoji}</span>}
          </div>
          <div className="text-body-small text-on-surface-variant">
            {user.username}#{user.discriminator}
          </div>
        </div>

        <div className="mx-4 h-px bg-outline-variant/20" />

        {/* About Me */}
        {user.aboutMe && (
          <div className="px-4 py-3">
            <h4 className="text-label-large font-bold text-on-surface mb-1">ABOUT ME</h4>
            <p className="text-body-small text-on-surface-variant">{user.aboutMe}</p>
          </div>
        )}

        {/* Roles */}
        {user.roles && user.roles.length > 0 && (
          <div className="px-4 py-2">
            <h4 className="text-label-large font-bold text-on-surface mb-1.5">ROLES</h4>
            <div className="flex flex-wrap gap-1">
              {user.roles.map(role => (
                <span
                  key={role}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-label-small bg-surface-container-highest text-on-surface border border-outline-variant/30"
                >
                  <span className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ background: user.roleColor || '#8E9099' }} />
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Activity */}
        {user.activity && (
          <div className="px-4 py-2">
            <h4 className="text-label-large font-bold text-on-surface mb-1">ACTIVITY</h4>
            <p className="text-body-small text-on-surface-variant">{user.activity}</p>
          </div>
        )}

        {/* Note */}
        <div className="px-4 py-2">
          <h4 className="text-label-large font-bold text-on-surface mb-1">NOTE</h4>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Click to add a note"
            className="w-full bg-surface-container rounded-lg px-2.5 py-1.5 text-body-small text-on-surface placeholder:text-on-surface-variant/50 border-none focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-3 flex gap-2">
          <button className="flex-1 bg-primary text-on-primary px-4 py-2 rounded-full text-label-large font-medium hover:bg-primary/90 transition-colors">
            Message
          </button>
          <button className="px-4 py-2 rounded-full text-label-large font-medium border border-outline-variant text-on-surface hover:bg-surface-container-highest transition-colors">
            Add Friend
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
    <div
      key={user.id}
      className={`flex items-center p-2 rounded-lg cursor-pointer group transition-colors duration-200 state-layer relative
        ${user.status === 'offline' ? 'opacity-50 hover:opacity-100' : ''}
        hover:bg-surface-container-high
      `}
      onClick={() => setSelectedUser(user)}
      role="button"
      aria-label={`${user.username} - ${user.status}${user.activity ? ` - ${user.activity}` : ''}`}
    >
      <div className="relative flex-shrink-0">
        <img
          src={user.avatar}
          alt={user.username}
          className={`w-8 h-8 rounded-full ${user.status === 'offline' ? 'grayscale' : ''}`}
        />
        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-surface-container-low ${getStatusColor(user.status)}`} />
      </div>
      <div className="ml-3 overflow-hidden flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span
            className="text-body-medium font-medium truncate"
            style={{ color: user.status !== 'offline' ? (user.roleColor || 'inherit') : undefined }}
          >
            {user.username}
          </span>
          {user.statusEmoji && <span className="text-xs flex-shrink-0">{user.statusEmoji}</span>}
        </div>
        {user.activity && user.status !== 'offline' && (
          <div className="text-label-small text-on-surface-variant truncate">
            {user.activity}
          </div>
        )}
      </div>

      {/* Profile popout */}
      {selectedUser?.id === user.id && (
        <ProfilePopout user={user} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onCloseMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden animate-fade-in"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed inset-y-0 right-0 w-[260px] bg-surface-container-low flex flex-col
        transform transition-transform duration-300 ease-emphasized z-40
        md:relative md:w-60 md:translate-x-0 md:flex-shrink-0
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        ${!isOpen ? 'hidden md:flex' : 'flex'}
      `}>
        {/* Header */}
        <div className="h-12 px-4 flex items-center border-b border-outline-variant/10 flex-shrink-0">
          <span className="text-label-large font-bold text-on-surface-variant uppercase tracking-wider">
            Members — {users.length}
          </span>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="ml-auto p-1 rounded-full hover:bg-surface-container-high md:hidden"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-4 thin-scrollbar">
          {/* Online Group */}
          {onlineUsers.length > 0 && (
            <div>
              <div className="px-2 mb-1.5 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Online — {onlineUsers.length}
              </div>
              {onlineUsers.map(renderUser)}
            </div>
          )}

          {/* Offline Group */}
          {offlineUsers.length > 0 && (
            <div>
              <div className="px-2 mb-1.5 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
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
