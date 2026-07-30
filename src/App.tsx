import { useState, useEffect } from 'react';
import { TapScreen } from './components/TapScreen';
import { QuestsScreen } from './components/QuestsScreen';
import { TabBar } from './components/TabBar';
import { useTelegram } from './hooks/useTelegram';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'tap' | 'quests'>('tap');
  const { expand, ready } = useTelegram();

  useEffect(() => {
    // Notify Telegram that the app is ready and expand to full height
    ready();
    expand();
  }, [expand, ready]);

  return (
    <div className="app-container">
      <div className="app-bg" />
      <main className="app-content">
        {activeTab === 'tap' ? <TapScreen /> : <QuestsScreen />}
      </main>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
