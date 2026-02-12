import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Bell, BellOff } from 'lucide-react';

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
    <div className="w-80 bg-background-secondary rounded-lg shadow-2xl flex flex-col border border-background-tertiary overflow-hidden">
      <div className="p-4 bg-background-tertiary flex justify-between items-center">
        <h3 className="text-white font-bold text-sm">Notifications</h3>
        <button className="text-header-secondary hover:text-white"><Bell size={16} /></button>
      </div>
      
      <div className="flex-1 overflow-y-auto max-h-96">
        {notifications.length > 0 ? (
          notifications.map(n => (
            <div 
              key={n.id} 
              className={`p-4 border-b border-background-tertiary hover:bg-background-tertiary/30 transition-colors flex items-start space-x-3 cursor-pointer ${!n.is_read ? 'bg-nautilus/5' : ''}`}
              onClick={() => markAsRead(n.id)}
            >
              <div className="flex-1">
                <div className="text-sm font-bold text-header-primary">{n.title}</div>
                <div className="text-xs text-header-secondary mt-1">{n.body}</div>
                <div className="text-[10px] text-header-secondary mt-2 uppercase">{new Date(n.created_at).toLocaleDateString()}</div>
              </div>
              {!n.is_read && <div className="w-2 h-2 bg-nautilus rounded-full mt-1"></div>}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-header-secondary flex flex-col items-center">
            <BellOff size={32} className="mb-2 opacity-20" />
            <div className="text-sm">No new notifications</div>
          </div>
        )}
      </div>
    </div>
  );
}
