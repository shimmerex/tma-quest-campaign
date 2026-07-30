import './TabBar.css';

interface TabBarProps {
  activeTab: 'tap' | 'boosts' | 'quests' | 'friends';
  onTabChange: (tab: 'tap' | 'boosts' | 'quests' | 'friends') => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const tabs = [
    { id: 'tap', label: 'Tap', icon: '👆' },
    { id: 'boosts', label: 'Boosts', icon: '🚀' },
    { id: 'quests', label: 'Quests', icon: '📋' },
    { id: 'friends', label: 'Friends', icon: '👥' },
  ] as const;

  return (
    <nav className="tab-bar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-item ${activeTab === tab.id ? 'tab-active' : ''}`}
          onClick={() => onTabChange(tab.id as any)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
