import { useState, useEffect } from 'react';
import { api } from '../services/api';

export function GuildSettingsModal({ guildId, onClose }: { guildId: string, onClose: () => void }) {
  const [tab, setTab] = useState<'roles' | 'audit' | 'automod'>('roles');
  const [roles, setRoles] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (tab === 'roles') {
      api.get(`/guilds/${guildId}/roles`).then(res => setRoles(res.data));
    } else if (tab === 'audit') {
      api.get(`/guilds/${guildId}/audit-log`).then(res => setLogs(res.data));
    }
  }, [tab, guildId]);

  return (
    <div className="fixed inset-0 bg-surface z-[200] flex animate-fade-in">
      {/* Sidebar */}
      <div className="w-[280px] bg-surface-container-low flex flex-col p-4 border-r border-outline-variant/10">
        <div className="px-4 py-6">
          <h2 className="text-title-medium font-bold text-on-surface">Server Settings</h2>
          <p className="text-[11px] text-on-surface-variant font-bold uppercase tracking-widest mt-1 opacity-60">Management</p>
        </div>
        
        <div className="flex-1 space-y-1">
          {[
            { id: 'roles', label: 'Roles', icon: 'shield' },
            { id: 'automod', label: 'Auto-Mod', icon: 'bolt' },
            { id: 'audit', label: 'Audit Log', icon: 'list_alt' },
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
          className="m3-navigation-drawer-item !mx-0 text-error hover:bg-error/10"
        >
          <span className="material-symbols-outlined">close</span>
          <span>Close Settings</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-surface thin-scrollbar">
        <div className="max-w-4xl mx-auto">
          {tab === 'roles' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-headline-medium font-bold text-on-surface">Roles</h1>
                  <p className="text-body-medium text-on-surface-variant">Manage member permissions and tags.</p>
                </div>
                <button className="m3-button-filled">
                  <span className="material-symbols-outlined">add</span>
                  Create Role
                </button>
              </div>
              
              <div className="grid gap-3">
                {roles.map(role => (
                  <div key={role.id} className="m3-card !p-4 flex items-center justify-between group border border-outline-variant/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full shadow-inner flex items-center justify-center" style={{ backgroundColor: role.color + '20' }}>
                        <span className="material-symbols-outlined" style={{ color: role.color }}>shield</span>
                      </div>
                      <div>
                        <span className="font-bold text-on-surface">{role.name}</span>
                        <p className="text-[10px] text-on-surface-variant font-mono uppercase opacity-60">ID: {role.id.slice(0,8)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="m3-icon-button hover:text-primary transition-colors"><span className="material-symbols-outlined">edit</span></button>
                      <button className="m3-icon-button hover:text-error transition-colors"><span className="material-symbols-outlined">delete</span></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'audit' && (
            <div className="animate-fade-in">
              <h1 className="text-headline-medium font-bold text-on-surface mb-2">Audit Log</h1>
              <p className="text-body-medium text-on-surface-variant mb-8">A record of all administrative actions in the server.</p>
              
              <div className="space-y-3">
                {logs.map(log => (
                  <div key={log.id} className="m3-card !p-5 flex flex-col gap-3 border border-outline-variant/5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                          <span className="material-symbols-outlined">person</span>
                        </div>
                        <div>
                          <p className="text-body-medium text-on-surface">
                            <span className="font-bold">{log.users.display_name}</span>
                            <span className="text-on-surface-variant"> performed </span>
                            <span className="font-black text-primary uppercase text-xs tracking-tighter">{log.action_type}</span>
                          </p>
                          <p className="text-[11px] text-on-surface-variant/60 font-medium">
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    {log.reason && (
                      <div className="bg-error-container/10 border-l-4 border-error p-3 rounded-r-lg">
                        <p className="text-xs text-on-error-container italic">Reason: {log.reason}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'automod' && (
            <div className="animate-fade-in">
              <h1 className="text-headline-medium font-bold text-on-surface mb-2">Auto-Moderation</h1>
              <p className="text-body-medium text-on-surface-variant mb-8">Automate server protection with custom filtering rules.</p>
              
              <div className="m3-card !p-8 flex flex-col items-center text-center bg-surface-container-high border border-outline-variant/10">
                <div className="w-20 h-20 rounded-[24px] bg-primary-container flex items-center justify-center text-on-primary-container mb-6 shadow-elevation-1">
                  <span className="material-symbols-outlined text-[40px]">security</span>
                </div>
                <h3 className="text-title-large font-bold text-on-surface mb-2">Safe & Sound</h3>
                <p className="text-body-medium text-on-surface-variant max-w-sm mb-8 leading-relaxed">
                  Block messages containing specific keywords, patterns, or suspicious links automatically.
                </p>
                <button className="m3-button-filled !h-12 !px-8">
                  <span className="material-symbols-outlined">add</span>
                  Create Your First Rule
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
