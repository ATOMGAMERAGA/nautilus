import { useEffect, useState } from 'react';
import { api } from '../services/api';

export function NotificationList() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    api.get('/notifications').then(res => setNotifications(res.data));
  }, []);

  const markAsRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  return (
    <div className="w-[320px] max-w-[90vw] bg-surface-container rounded-[28px] shadow-elevation-3 flex flex-col border border-outline-variant/10 overflow-hidden animate-scale-in">
      <div className="p-5 bg-surface-container-high border-b border-outline-variant/10 flex justify-between items-center shrink-0">
        <h3 className="text-on-surface font-bold text-title-medium">Notifications</h3>
        <span className="material-symbols-outlined text-primary text-[22px]">notifications</span>
      </div>
      
      <div className="flex-1 overflow-y-auto max-h-[400px] thin-scrollbar py-2">
        {notifications.length > 0 ? (
          notifications.map(n => (
            <div 
              key={n.id} 
              className={`px-4 py-3 hover:bg-on-surface/[0.04] transition-all flex items-start gap-3 cursor-pointer group state-layer relative ${!n.is_read ? 'bg-primary-container/[0.08]' : ''}`}
              onClick={() => markAsRead(n.id)}
            >
              {!n.is_read && (
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full" />
              )}
              <div className="flex-1 min-w-0">
                <div className={`text-label-large font-bold truncate ${!n.is_read ? 'text-primary' : 'text-on-surface'}`}>
                  {n.title}
                </div>
                <div className="text-body-small text-on-surface-variant line-clamp-2 mt-0.5 leading-snug">
                  {n.body}
                </div>
                <div className="text-[10px] text-on-surface-variant/50 mt-2 font-bold uppercase tracking-widest">
                  {new Date(n.created_at).toLocaleDateString()}
                </div>
              </div>
              {!n.is_read && <div className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0 shadow-sm animate-pulse-glow" />}
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-on-surface-variant flex flex-col items-center justify-center opacity-40">
            <span className="material-symbols-outlined text-[48px] mb-3">notifications_off</span>
            <div className="text-label-large">All caught up!</div>
            <p className="text-[11px] mt-1">No new notifications</p>
          </div>
        )}
      </div>
      <div className="p-3 bg-surface-container-high border-t border-outline-variant/10 flex justify-center shrink-0">
        <button className="m3-button-text !h-8 !text-[11px] w-full">Mark all as read</button>
      </div>
    </div>
  );
}
