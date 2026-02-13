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
      className="fixed bottom-0 left-0 right-0 h-16 bg-surface-container border-t border-outline-variant/10 flex items-center justify-around z-50 md:hidden safe-area-bottom"
      role="navigation"
      aria-label="Mobile navigation"
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabSelect(tab.id)}
            className="flex flex-col items-center justify-center w-full h-full relative group transition-colors"
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            {/* Active indicator pill */}
            {isActive && (
              <div className="absolute top-2 w-16 h-8 bg-secondary-container rounded-full animate-scale-in" />
            )}
            <span className={`material-symbols-outlined text-[24px] relative z-10 transition-colors ${
              isActive ? 'filled text-on-secondary-container' : 'text-on-surface-variant'
            }`}>
              {isActive ? tab.filledIcon : tab.icon}
            </span>
            <span className={`text-[10px] font-medium mt-0.5 relative z-10 transition-colors ${
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
