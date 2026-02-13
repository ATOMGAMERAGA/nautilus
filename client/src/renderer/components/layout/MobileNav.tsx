import React from 'react';

interface MobileNavProps {
  activeTab: 'home' | 'servers' | 'search' | 'profile';
  onTabSelect: (tab: 'home' | 'servers' | 'search' | 'profile') => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onTabSelect }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface-container-low border-t border-outline-variant/20 flex items-center justify-around z-50 md:hidden shadow-elevation-2">
      <button 
        onClick={() => onTabSelect('home')}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'home' ? 'text-primary' : 'text-on-surface-variant'}`}
      >
        <span className={`material-symbols-outlined text-[24px] ${activeTab === 'home' ? 'filled' : ''}`}>home</span>
        <span className="text-[10px] font-medium">Home</span>
      </button>

      <button 
        onClick={() => onTabSelect('servers')}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'servers' ? 'text-primary' : 'text-on-surface-variant'}`}
      >
        <span className={`material-symbols-outlined text-[24px] ${activeTab === 'servers' ? 'filled' : ''}`}>dns</span>
        <span className="text-[10px] font-medium">Servers</span>
      </button>

      <button 
        onClick={() => onTabSelect('search')}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'search' ? 'text-primary' : 'text-on-surface-variant'}`}
      >
        <span className={`material-symbols-outlined text-[24px] ${activeTab === 'search' ? 'filled' : ''}`}>search</span>
        <span className="text-[10px] font-medium">Search</span>
      </button>

      <button 
        onClick={() => onTabSelect('profile')}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'profile' ? 'text-primary' : 'text-on-surface-variant'}`}
      >
        <span className={`material-symbols-outlined text-[24px] ${activeTab === 'profile' ? 'filled' : ''}`}>account_circle</span>
        <span className="text-[10px] font-medium">Profile</span>
      </button>
    </nav>
  );
};
