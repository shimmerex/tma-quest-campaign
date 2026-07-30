import './TabBar.css';

interface TabBarProps {
  activeTab: 'tap' | 'quests';
  onTabChange: (tab: 'tap' | 'quests') => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className="tab-bar" id="tab-bar">
      <button
        type="button"
        className={`tab-item ${activeTab === 'tap' ? 'tab-active' : ''}`}
        onClick={() => onTabChange('tap')}
        id="tab-tap"
      >
        <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v12M6 12h12" />
        </svg>
        <span className="tab-label">Tap</span>
      </button>
      <button
        type="button"
        className={`tab-item ${activeTab === 'quests' ? 'tab-active' : ''}`}
        onClick={() => onTabChange('quests')}
        id="tab-quests"
      >
        <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
        <span className="tab-label">Quests</span>
      </button>
    </nav>
  );
}
