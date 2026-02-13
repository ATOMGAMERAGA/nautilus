import React from 'react';
import type { User } from '../../data/mock';

interface MemberSidebarProps {
  users: User[];
  isOpen: boolean; // For mobile toggle or desktop collapse
  onCloseMobile?: () => void;
}

export const MemberSidebar: React.FC<MemberSidebarProps> = ({
  users,
  isOpen,
  onCloseMobile
}) => {
  // Group users by status for this demo (or role)
  const onlineUsers = users.filter(u => u.status !== 'offline');
  const offlineUsers = users.filter(u => u.status === 'offline');

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden animate-fade-in"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed inset-y-0 right-0 w-[240px] bg-surface-container-low border-l border-outline-variant/20
        transform transition-transform duration-300 ease-emphasized z-40
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        hidden md:block md:translate-x-0 md:relative md:w-60
      `}>
        <div className="h-12 px-4 flex items-center shadow-sm text-title-small font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/10">
          Members
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-6 h-[calc(100%-48px)] no-scrollbar">
          {/* Online Group */}
          <div>
            <div className="px-2 mb-2 text-label-small font-bold text-on-surface-variant uppercase opacity-80">
              Online — {onlineUsers.length}
            </div>
            {onlineUsers.map(user => (
              <div key={user.id} className="flex items-center p-2 rounded-md hover:bg-surface-container-high cursor-pointer group transition-colors duration-200">
                <div className="relative">
                  <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full" />
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-surface-container-low ${
                    user.status === 'online' ? 'bg-green-500' :
                    user.status === 'idle' ? 'bg-yellow-500' :
                    'bg-red-500' // dnd
                  }`} />
                </div>
                <div className="ml-3 overflow-hidden">
                  <div className="text-body-medium font-medium truncate" style={{ color: user.roleColor || 'inherit' }}>
                    {user.username}
                  </div>
                  {user.activity && (
                    <div className="text-label-small text-on-surface-variant truncate opacity-80">
                      {user.activity}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Offline Group */}
          <div>
            <div className="px-2 mb-2 text-label-small font-bold text-on-surface-variant uppercase opacity-80">
              Offline — {offlineUsers.length}
            </div>
            {offlineUsers.map(user => (
              <div key={user.id} className="flex items-center p-2 rounded-md hover:bg-surface-container-high cursor-pointer group opacity-50 hover:opacity-100 transition-opacity">
                <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full grayscale" />
                <div className="ml-3">
                  <div className="text-body-medium font-medium truncate text-on-surface-variant">
                    {user.username}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};
