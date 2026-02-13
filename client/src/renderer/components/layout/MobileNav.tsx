import React from 'react';

interface MobileNavProps {
  activeTab: 'home' | 'servers' | 'search' | 'profile' | 'settings';
  onTabSelect: (tab: 'home' | 'servers' | 'search' | 'profile' | 'settings') => void;
}

const tabs: { id: MobileNavProps['activeTab']; icon: string; filledIcon: string; label: string }[] = [
  { id: 'home', icon: 'home', filledIcon: 'home', label: 'Home' },
  { id: 'servers', icon: 'dns', filledIcon: 'dns', label: 'Servers' },
  { id: 'search', icon: 'search', filledIcon: 'search', label: 'Search' },
  { id: 'profile', icon: 'account_circle', filledIcon: 'account_circle', label: 'Profile' },
  { id: 'settings', icon: 'settings', filledIcon: 'settings', label: 'Settings' },
];

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onTabSelect }) => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-20 bg-surface-container border-t border-outline-variant/10 flex items-center justify-around z-50 md:hidden safe-area-bottom px-2"
      role="navigation"
      aria-label="Mobile navigation"
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabSelect(tab.id)}
            className="flex flex-col items-center justify-center flex-1 h-full relative group transition-colors pt-3 pb-2"
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            {/* Active indicator pill */}
            <div className="relative flex flex-col items-center">
              <div className={`absolute top-[-4px] w-16 h-8 bg-secondary-container rounded-full transition-all duration-300 ease-emphasized ${
                isActive ? 'scale-100 opacity-100' : 'scale-[0.5] opacity-0'
              }`} />
              
              <span className={`material-symbols-outlined text-[24px] relative z-10 transition-colors duration-200 ${
                isActive ? 'filled text-on-secondary-container' : 'text-on-surface-variant group-hover:text-on-surface'
              }`}>
                {isActive ? tab.filledIcon : tab.icon}
              </span>
            </div>
            
            <span className={`text-label-small font-medium mt-1 relative z-10 transition-colors duration-200 ${
              isActive ? 'text-on-surface' : 'text-on-surface-variant'
            }`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
