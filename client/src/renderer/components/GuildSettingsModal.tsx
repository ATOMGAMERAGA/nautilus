import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Shield, List, Zap, X } from 'lucide-react';

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
    <div className="fixed inset-0 bg-background-primary z-[200] flex">
      {/* Sidebar */}
      <div className="w-60 bg-background-secondary flex flex-col p-6 space-y-4">
        <h2 className="text-header-secondary font-bold text-xs uppercase mb-2">Server Settings</h2>
        <button onClick={() => setTab('roles')} className={`flex items-center space-x-2 p-2 rounded ${tab === 'roles' ? 'bg-background-tertiary text-white' : 'text-header-secondary'}`}>
          <Shield size={18} /> <span>Roles</span>
        </button>
        <button onClick={() => setTab('automod')} className={`flex items-center space-x-2 p-2 rounded ${tab === 'automod' ? 'bg-background-tertiary text-white' : 'text-header-secondary'}`}>
          <Zap size={18} /> <span>Auto-Mod</span>
        </button>
        <button onClick={() => setTab('audit')} className={`flex items-center space-x-2 p-2 rounded ${tab === 'audit' ? 'bg-background-tertiary text-white' : 'text-header-secondary'}`}>
          <List size={18} /> <span>Audit Log</span>
        </button>
        
        <div className="flex-1"></div>
        
        <button onClick={onClose} className="flex items-center space-x-2 p-2 text-header-secondary hover:text-white">
          <X size={18} /> <span>Close</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        {tab === 'roles' && (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-white mb-6">Roles</h1>
            <div className="space-y-2">
              {roles.map(role => (
                <div key={role.id} className="bg-background-secondary p-4 rounded flex items-center justify-between border-l-4" style={{ borderLeftColor: role.color }}>
                  <span className="font-medium text-white">{role.name}</span>
                  <div className="flex space-x-2">
                    <button className="text-header-secondary hover:text-white text-sm">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'audit' && (
          <div className="max-w-4xl">
            <h1 className="text-2xl font-bold text-white mb-6">Audit Log</h1>
            <div className="space-y-4">
              {logs.map(log => (
                <div key={log.id} className="bg-background-secondary p-4 rounded flex flex-col space-y-1">
                  <div className="text-sm text-header-primary">
                    <span className="font-bold text-white">{log.users.display_name}</span> 
                    <span className="text-header-secondary"> triggered </span> 
                    <span className="font-bold text-white">{log.action_type}</span>
                  </div>
                  <div className="text-xs text-header-secondary">{new Date(log.created_at).toLocaleString()}</div>
                  {log.reason && <div className="text-xs text-red-400 mt-2 italic">Reason: {log.reason}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'automod' && (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-white mb-6">Auto-Moderation</h1>
            <div className="bg-background-secondary p-6 rounded border border-background-tertiary">
              <p className="text-header-secondary text-sm">Automate your server protection with rules that block messages containing specific keywords or patterns.</p>
              <button className="mt-4 bg-nautilus text-white px-4 py-2 rounded font-medium text-sm">Create Rule</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
