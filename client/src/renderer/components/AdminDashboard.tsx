import { useEffect, useState } from 'react';
import { api } from '../services/api';

export function AdminDashboard({ onClose }: { onClose: () => void }) {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [tab, setTab] = useState<'overview' | 'users'>('overview');

  useEffect(() => {
    api.get('/admin/stats').then(res => setStats(res.data));
    api.get('/admin/users').then(res => setUsers(res.data));
  }, []);

  return (
    <div className="fixed inset-0 bg-surface z-[300] flex animate-fade-in">
      {/* M3 Sidebar Navigation */}
      <div className="w-[280px] bg-surface-container-low flex flex-col p-4 border-r border-outline-variant/10">
        <div className="px-4 py-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-primary-container flex items-center justify-center text-primary shadow-elevation-1">
            <span className="material-symbols-outlined text-[24px]">shield_person</span>
          </div>
          <h2 className="text-title-medium font-bold text-on-surface">Platform Admin</h2>
        </div>
        
        <div className="flex-1 space-y-1">
          {[
            { id: 'overview', label: 'Overview', icon: 'dashboard' },
            { id: 'users', label: 'Users', icon: 'person_search' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as any)}
              className={`w-full m3-navigation-drawer-item !mx-0 ${tab === item.id ? 'active' : ''}`}
            >
              <span className={`material-symbols-outlined ${tab === item.id ? 'filled' : ''}`}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        
        <div className="m3-divider my-4" />
        
        <button 
          onClick={onClose} 
          className="m3-navigation-drawer-item !mx-0 text-on-surface-variant hover:bg-on-surface/[0.08]"
        >
          <span className="material-symbols-outlined">exit_to_app</span>
          <span>Exit Dashboard</span>
        </button>
      </div>

      <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-surface thin-scrollbar">
        <div className="max-w-6xl mx-auto">
          {tab === 'overview' && stats && (
            <div className="animate-fade-in space-y-10">
              <div>
                <h1 className="text-headline-medium font-bold text-on-surface">System Overview</h1>
                <p className="text-body-medium text-on-surface-variant">Real-time platform usage metrics.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Total Users', value: stats.totalUsers, icon: 'group', color: 'text-primary' },
                  { label: 'Total Servers', value: stats.totalGuilds, icon: 'dns', color: 'text-secondary' },
                  { label: 'Messages Sent', value: stats.totalMessages, icon: 'chat', color: 'text-tertiary' },
                ].map((stat, i) => (
                  <div key={i} className="m3-card !p-6 border border-outline-variant/10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-label-medium font-bold text-on-surface-variant uppercase tracking-widest">{stat.label}</span>
                      <span className={`material-symbols-outlined ${stat.color}`}>{stat.icon}</span>
                    </div>
                    <div className="text-4xl font-bold text-on-surface tracking-tight">{stat.value.toLocaleString()}</div>
                    <div className="mt-4 flex items-center gap-1.5 text-green-600 text-[11px] font-bold">
                      <span className="material-symbols-outlined text-[14px]">trending_up</span>
                      <span>+12.5% vs last week</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h1 className="text-headline-medium font-bold text-on-surface">User Management</h1>
                <p className="text-body-medium text-on-surface-variant">Monitor and moderate registered accounts.</p>
              </div>

              <div className="m3-card !p-0 border border-outline-variant/10 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-high text-on-surface-variant text-label-small font-bold uppercase tracking-widest border-b border-outline-variant/10">
                    <tr>
                      <th className="p-5">User Profile</th>
                      <th className="p-5">Global Role</th>
                      <th className="p-5">Account Status</th>
                      <th className="p-5 text-right">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-body-medium text-on-surface">
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-outline-variant/5 hover:bg-on-surface/[0.02] transition-colors">
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shadow-sm">
                              {u.display_name[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold">{u.display_name}</div>
                              <div className="text-[11px] text-on-surface-variant opacity-60">@{u.username} • #{u.user_id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                            u.global_role === 'owner' 
                              ? 'bg-primary text-on-primary shadow-sm' 
                              : 'bg-surface-container-highest text-on-surface-variant'
                          }`}>
                            {u.global_role}
                          </span>
                        </td>
                        <td className="p-5">
                          {u.is_banned ? (
                            <div className="flex items-center gap-1.5 text-error font-bold text-xs">
                              <span className="material-symbols-outlined text-[16px]">block</span>
                              Banned
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-green-600 font-bold text-xs">
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                              Active
                            </div>
                          )}
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button className="m3-icon-button hover:text-primary" title="Edit Badges"><span className="material-symbols-outlined text-[20px]">workspace_premium</span></button>
                            {u.global_role !== 'owner' && (
                              <button className="m3-icon-button hover:text-error" title="Ban User"><span className="material-symbols-outlined text-[20px]">person_off</span></button>
                            )}
                          </div>
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
    </div>
  );
}
