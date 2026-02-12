import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Users, Shield, BarChart3, X } from 'lucide-react';

export function AdminDashboard({ onClose }: { onClose: () => void }) {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [tab, setTab] = useState<'overview' | 'users'>('overview');

  useEffect(() => {
    api.get('/admin/stats').then(res => setStats(res.data));
    api.get('/admin/users').then(res => setUsers(res.data));
  }, []);

  return (
    <div className="fixed inset-0 bg-background-primary z-[300] flex">
      <div className="w-64 bg-background-tertiary flex flex-col p-6 space-y-4">
        <h2 className="text-nautilus font-bold text-lg mb-4 flex items-center">
          <Shield className="mr-2" /> Platform Admin
        </h2>
        
        <button onClick={() => setTab('overview')} className={`flex items-center space-x-2 p-2 rounded ${tab === 'overview' ? 'bg-background-secondary text-white' : 'text-header-secondary'}`}>
          <BarChart3 size={18} /> <span>Overview</span>
        </button>
        <button onClick={() => setTab('users')} className={`flex items-center space-x-2 p-2 rounded ${tab === 'users' ? 'bg-background-secondary text-white' : 'text-header-secondary'}`}>
          <Users size={18} /> <span>User Management</span>
        </button>
        
        <div className="flex-1"></div>
        <button onClick={onClose} className="p-2 text-header-secondary hover:text-white flex items-center space-x-2">
          <X size={18} /> <span>Exit Dashboard</span>
        </button>
      </div>

      <div className="flex-1 p-10 overflow-y-auto">
        {tab === 'overview' && stats && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">System Overview</h1>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-background-secondary p-6 rounded-lg border border-background-tertiary">
                <div className="text-header-secondary text-sm uppercase font-bold">Total Users</div>
                <div className="text-4xl font-bold text-white mt-2">{stats.totalUsers}</div>
              </div>
              <div className="bg-background-secondary p-6 rounded-lg border border-background-tertiary">
                <div className="text-header-secondary text-sm uppercase font-bold">Total Servers</div>
                <div className="text-4xl font-bold text-white mt-2">{stats.totalGuilds}</div>
              </div>
              <div className="bg-background-secondary p-6 rounded-lg border border-background-tertiary">
                <div className="text-header-secondary text-sm uppercase font-bold">Messages Sent</div>
                <div className="text-4xl font-bold text-white mt-2">{stats.totalMessages}</div>
              </div>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <div className="bg-background-secondary rounded-lg overflow-hidden border border-background-tertiary">
              <table className="w-full text-left">
                <thead className="bg-background-tertiary text-header-secondary text-xs uppercase">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Global Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-header-primary">
                  {users.map(u => (
                    <tr key={u.id} className="border-t border-background-tertiary hover:bg-background-tertiary/20">
                      <td className="p-4">
                        <div className="font-bold">{u.display_name}</div>
                        <div className="text-xs text-header-secondary">@{u.username} • #{u.user_id}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.global_role === 'owner' ? 'bg-yellow-600 text-white' : 'bg-background-tertiary'}`}>
                          {u.global_role}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.is_banned ? <span className="text-red-500">Banned</span> : <span className="text-green-500">Active</span>}
                      </td>
                      <td className="p-4">
                        <button className="text-nautilus hover:underline text-sm mr-4">Badges</button>
                        {u.global_role !== 'owner' && (
                          <button className="text-red-500 hover:underline text-sm">Ban</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
