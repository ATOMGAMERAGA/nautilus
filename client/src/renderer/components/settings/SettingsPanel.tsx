import React, { useState } from 'react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const TABS = [
  { id: 'account', label: 'My Account', icon: 'person' },
  { id: 'profile', label: 'Profile', icon: 'badge' },
  { id: 'appearance', label: 'Appearance', icon: 'palette' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications' },
  { id: 'voice', label: 'Voice & Audio', icon: 'mic' },
  { id: 'keybinds', label: 'Keybinds', icon: 'keyboard' },
  { id: 'about', label: 'About Nautilus', icon: 'info' },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('account');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Settings Card */}
      <div className="relative w-full h-full md:w-[800px] md:h-[600px] bg-surface md:rounded-[28px] shadow-elevation-5 flex flex-col md:flex-row overflow-hidden animate-scale-in">
        
        {/* Sidebar */}
        <div className="w-full md:w-[240px] bg-surface-container-low p-4 flex flex-col border-r border-outline-variant/20">
           <div className="md:hidden flex items-center justify-between mb-4">
              <h2 className="text-title-large font-bold">Settings</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container-high">
                 <span className="material-symbols-outlined">close</span>
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto space-y-1">
             {TABS.map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`w-full flex items-center px-4 py-3 rounded-full text-left transition-colors
                   ${activeTab === tab.id 
                     ? 'bg-secondary-container text-on-secondary-container font-bold' 
                     : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                   }
                 `}
               >
                 <span className="material-symbols-outlined mr-3 text-[20px]">{tab.icon}</span>
                 <span className="text-label-large">{tab.label}</span>
               </button>
             ))}
           </div>
           
           {/* Version info on Desktop Sidebar */}
           <div className="hidden md:block mt-4 pt-4 border-t border-outline-variant/20 text-xs text-on-surface-variant opacity-60">
              Nautilus v1.0.0
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-surface relative">
           <div className="hidden md:flex absolute top-4 right-4">
              <button onClick={onClose} className="flex flex-col items-center justify-center w-8 h-8 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors group">
                 <span className="material-symbols-outlined group-hover:text-on-surface">close</span>
                 <span className="text-[10px] mt-0.5">ESC</span>
              </button>
           </div>

           <div className="flex-1 overflow-y-auto p-6 md:p-10">
              {activeTab === 'account' && (
                <div className="space-y-6 max-w-lg animate-fade-in">
                   <h2 className="text-title-large font-bold mb-6">My Account</h2>
                   
                   {/* Banner / Avatar Card */}
                   <div className="bg-primary rounded-[16px] p-4 text-on-primary mb-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8" />
                      <div className="flex items-center relative z-10">
                         <div className="w-20 h-20 rounded-full border-4 border-surface bg-surface mr-4">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=NautilusUser" className="w-full h-full" />
                         </div>
                         <div>
                            <div className="text-title-medium font-bold">NautilusUser</div>
                            <div className="text-body-medium opacity-80">User #1337</div>
                         </div>
                         <button className="ml-auto bg-primary-container text-on-primary-container px-4 py-2 rounded-full text-label-large font-medium hover:brightness-95 transition-all shadow-sm">
                            Edit Profile
                         </button>
                      </div>
                   </div>

                   {/* Form Fields */}
                   <div className="space-y-4">
                      <div className="flex flex-col space-y-1">
                         <label className="text-label-large font-bold text-on-surface-variant">USERNAME</label>
                         <div className="p-3 bg-surface-container-high rounded-md flex justify-between items-center">
                            <span>NautilusUser</span>
                            <button className="text-primary text-label-large hover:underline">Edit</button>
                         </div>
                      </div>
                      
                      <div className="flex flex-col space-y-1">
                         <label className="text-label-large font-bold text-on-surface-variant">EMAIL</label>
                         <div className="p-3 bg-surface-container-high rounded-md flex justify-between items-center">
                            <span>user@nautilus.app</span>
                            <button className="text-primary text-label-large hover:underline">Edit</button>
                         </div>
                      </div>

                      <div className="flex flex-col space-y-1">
                         <label className="text-label-large font-bold text-on-surface-variant">PHONE NUMBER</label>
                         <div className="p-3 bg-surface-container-high rounded-md flex justify-between items-center">
                            <span className="opacity-50">Not Set</span>
                            <button className="text-primary text-label-large hover:underline">Add</button>
                         </div>
                      </div>
                   </div>

                   <div className="pt-8 border-t border-outline-variant/20">
                      <h3 className="text-title-medium font-bold mb-4">Password & Authentication</h3>
                      <button className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-medium hover:bg-primary/90 transition-colors shadow-elevation-1">
                         Change Password
                      </button>
                      <div className="mt-4">
                         <button className="w-full text-left p-4 border border-outline-variant rounded-lg flex items-center justify-between hover:bg-surface-container-high transition-colors group">
                            <div>
                               <div className="font-bold text-on-surface">Two-Factor Authentication</div>
                               <div className="text-body-small text-on-surface-variant">Protect your account with an extra layer of security.</div>
                            </div>
                            <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
                         </button>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                 <div className="space-y-6 max-w-lg animate-fade-in">
                    <h2 className="text-title-large font-bold mb-6">Appearance</h2>
                    
                    <div className="space-y-4">
                       <label className="text-label-large font-bold text-on-surface-variant block mb-2">THEME</label>
                       <div className="grid grid-cols-3 gap-4">
                          <button className="flex flex-col items-center group">
                             <div className="w-full aspect-video bg-[#FBF8FF] border-2 border-outline-variant rounded-lg mb-2 group-hover:border-primary" />
                             <span className="text-label-medium">Light</span>
                          </button>
                          <button className="flex flex-col items-center group">
                             <div className="w-full aspect-video bg-[#111318] border-2 border-primary rounded-lg mb-2 relative overflow-hidden">
                                <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                   <span className="material-symbols-outlined text-white text-[12px]">check</span>
                                </div>
                             </div>
                             <span className="text-label-medium font-bold">Dark</span>
                          </button>
                          <button className="flex flex-col items-center group">
                             <div className="w-full aspect-video bg-gradient-to-br from-[#FBF8FF] to-[#111318] border-2 border-outline-variant rounded-lg mb-2 group-hover:border-primary" />
                             <span className="text-label-medium">System</span>
                          </button>
                       </div>
                    </div>

                    <div className="pt-6">
                       <label className="text-label-large font-bold text-on-surface-variant block mb-2">MESSAGE DISPLAY</label>
                       <div className="space-y-2">
                          <label className="flex items-center p-3 rounded-lg border border-primary bg-secondary-container/20 cursor-pointer">
                             <input type="radio" name="density" defaultChecked className="w-4 h-4 text-primary" />
                             <div className="ml-3">
                                <div className="font-bold">Cozy</div>
                                <div className="text-body-small opacity-70">Modern, spacious, and beautiful.</div>
                             </div>
                          </label>
                          <label className="flex items-center p-3 rounded-lg border border-outline-variant hover:bg-surface-container-high cursor-pointer transition-colors">
                             <input type="radio" name="density" className="w-4 h-4 text-primary" />
                             <div className="ml-3">
                                <div className="font-bold">Compact</div>
                                <div className="text-body-small opacity-70">Fit more messages on screen.</div>
                             </div>
                          </label>
                       </div>
                    </div>
                 </div>
              )}
              
              {/* Placeholders for other tabs */}
              {['profile', 'notifications', 'voice', 'keybinds', 'about'].includes(activeTab) && (
                 <div className="flex flex-col items-center justify-center h-full opacity-50">
                    <span className="material-symbols-outlined text-[48px] mb-4 text-outline">{
                       TABS.find(t => t.id === activeTab)?.icon
                    }</span>
                    <div className="text-title-medium">Settings Section Placeholder</div>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
