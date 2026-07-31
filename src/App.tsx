import { useState, useEffect } from 'react';
import { useGameStore } from './stores/useGameStore';
import { TapScreen } from './components/TapScreen';
import { QuestsScreen } from './components/QuestsScreen';
import { BoostsScreen } from './components/BoostsScreen';
import { FriendsScreen } from './components/FriendsScreen';
import { TabBar } from './components/TabBar';
import { useTelegram } from './hooks/useTelegram';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'tap' | 'boosts' | 'quests' | 'friends'>('tap');
  const { expand, ready, hapticSuccess } = useTelegram();
  const offlineEarnings = useGameStore((s) => s.offlineEarnings);
  const claimOfflineEarnings = useGameStore((s) => s.claimOfflineEarnings);
  const hasOnboarded = useGameStore((s) => s.hasOnboarded);
  const completeOnboarding = useGameStore((s) => s.completeOnboarding);
  const syncWithServer = useGameStore((s) => s.syncWithServer);
  const syncTaps = useGameStore((s) => s.syncTaps);
  const setTgId = useGameStore((s) => s.setTgId);

  useEffect(() => {
    ready();
    expand();
    
    const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
    const realTgId = tgUser?.id?.toString() || 'mock-user-123';
    const realUsername = tgUser?.username || 'MockUser';
    setTgId(realTgId, realUsername);
    
    syncWithServer();

    // Setup periodic sync for batched taps every 2 seconds
    const interval = setInterval(() => {
      syncTaps();
    }, 2000);

    return () => clearInterval(interval);
  }, [expand, ready, syncWithServer, syncTaps, setTgId]);

  const handleClaimOffline = () => {
    claimOfflineEarnings();
    hapticSuccess();
  };

  const handleOnboard = () => {
    completeOnboarding();
    hapticSuccess();
  };

  return (
    <div className="app-container">
      <div className="app-bg" />
      <main className="app-content">
        {activeTab === 'tap' && <TapScreen />}
        {activeTab === 'boosts' && <BoostsScreen />}
        {activeTab === 'quests' && <QuestsScreen />}
        {activeTab === 'friends' && <FriendsScreen />}
      </main>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {offlineEarnings > 0 && hasOnboarded && (
        <div className="offline-modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="offline-modal" style={{ background: 'var(--game-surface)', border: '1px solid var(--game-border-alpha)', borderRadius: '24px', padding: '32px 24px', textAlign: 'center', width: '100%', maxWidth: '340px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Welcome Back!</h2>
            <p style={{ color: 'var(--tg-theme-hint-color)', marginBottom: '24px' }}>While you were away, your bots mined:</p>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--game-coin-primary)', marginBottom: '32px' }}>
              +{offlineEarnings.toLocaleString()}
            </div>
            <button onClick={handleClaimOffline} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'var(--game-accent)', color: '#fff', fontSize: '18px', fontWeight: 'bold', border: 'none' }}>
              Claim Rewards
            </button>
          </div>
        </div>
      )}

      {!hasOnboarded && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--game-bg)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🚀</div>
          <h1 style={{ fontSize: '32px', marginBottom: '16px', color: 'var(--tg-theme-text-color)' }}>Welcome to TMA Quest!</h1>
          <p style={{ color: 'var(--tg-theme-hint-color)', fontSize: '16px', marginBottom: '32px', lineHeight: '1.5' }}>
            Tap the coin to earn tokens, buy upgrades to boost your income, and complete quests to dominate the leagues!
          </p>
          <div style={{ background: 'var(--game-surface-alpha)', padding: '16px', borderRadius: '16px', marginBottom: '32px', width: '100%' }}>
            <h3 style={{ margin: '0 0 8px', color: 'var(--game-coin-primary)' }}>Starter Bonus</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>+1,000 🪙</p>
          </div>
          <button onClick={handleOnboard} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'var(--game-accent)', color: '#fff', fontSize: '18px', fontWeight: 'bold', border: 'none' }}>
            Start Earning
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
