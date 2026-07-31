import { useCallback, useRef, useEffect, useState, type MouseEvent } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { useTelegram } from '../hooks/useTelegram';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import './TapScreen.css';

export function TapScreen() {
  const balance = useGameStore((s) => s.balance);
  const energy = useGameStore((s) => s.energy);
  const maxEnergy = useGameStore((s) => s.maxEnergy);
  const tapPower = useGameStore((s) => s.tapPower);
  const consumeEnergy = useGameStore((s) => s.consumeEnergy);
  const regenEnergy = useGameStore((s) => s.regenEnergy);
  const { hapticFeedback } = useTelegram();
  const coinRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [showProfile, setShowProfile] = useState(false);
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  // Regenerate energy every second
  useEffect(() => {
    const interval = setInterval(() => {
      regenEnergy();
    }, 1000);
    return () => clearInterval(interval);
  }, [regenEnergy]);

  const handleTap = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!consumeEnergy()) {
        // Optional: play an error haptic if out of energy
        return;
      }

      hapticFeedback();
      
      // Create flying coin animation natively
      const coin = document.createElement('div');
      coin.className = 'flying-coin';
      coin.textContent = `+${tapPower}`;
      
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        coin.style.left = `${e.clientX - rect.left}px`;
        coin.style.top = `${e.clientY - rect.top}px`;
      }
      
      containerRef.current?.appendChild(coin);
      
      // Cleanup DOM element after animation completes to prevent memory leaks
      coin.addEventListener('animationend', () => {
        coin.remove();
      });

      // Add visual press effect to the big coin
      if (coinRef.current) {
        coinRef.current.style.transform = 'scale(0.95) translateZ(-10px)';
        setTimeout(() => {
          if (coinRef.current) coinRef.current.style.transform = 'scale(1) translateZ(0)';
        }, 100);
      }
    },
    [consumeEnergy, hapticFeedback, tapPower]
  );

  const formatBalance = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const hasEnergy = energy >= tapPower;
  const energyPercent = Math.min(100, Math.max(0, (energy / maxEnergy) * 100));

  const leagues = [
    { name: 'Bronze', min: 0, color: '#cd7f32' },
    { name: 'Silver', min: 5000, color: '#c0c0c0' },
    { name: 'Gold', min: 25000, color: '#ffd700' },
    { name: 'Platinum', min: 100000, color: '#e5e4e2' },
    { name: 'Diamond', min: 1000000, color: '#b9f2ff' },
  ];

  const currentLeagueIndex = leagues.map(l => l.min).findLastIndex(min => balance >= min) || 0;
  const currentLeague = leagues[currentLeagueIndex] || leagues[0];
  const nextLeague = leagues[currentLeagueIndex + 1];
  
  let leagueProgress = 100;
  if (nextLeague) {
    const range = nextLeague.min - currentLeague.min;
    const currentInLeague = balance - currentLeague.min;
    leagueProgress = Math.min(100, (currentInLeague / range) * 100);
  }

  return (
    <div className="tap-screen" ref={containerRef}>
      <div className="tap-header" style={{ position: 'relative' }}>
        <button 
          className="profile-btn" 
          onClick={() => setShowProfile(true)}
          style={{ position: 'absolute', left: 0, top: 0, width: '40px', height: '40px', borderRadius: '20px', background: 'var(--game-surface-alpha)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', cursor: 'pointer' }}
        >
          👤
        </button>
        <div className="league-badge" style={{ color: currentLeague.color, fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {currentLeague.name} League
        </div>
        <div className="balance-value">
          <span className="balance-icon">🪙</span>
          <span className="balance-number">{formatBalance(balance)}</span>
        </div>
        {nextLeague && (
          <div className="league-progress-container" style={{ width: '150px', height: '6px', background: 'var(--game-surface-alpha)', borderRadius: '4px', margin: '12px auto 0', overflow: 'hidden' }}>
            <div className="league-progress-fill" style={{ width: `${leagueProgress}%`, height: '100%', background: currentLeague.color, transition: 'width 0.3s ease' }} />
          </div>
        )}
      </div>

      <div className="coin-area">
        <div className="coin-glow" />
        <div
          ref={coinRef}
          className={`coin ${!hasEnergy ? 'coin-disabled' : ''}`}
          onClick={hasEnergy ? handleTap : undefined}
          role="button"
          tabIndex={0}
          id="tap-coin"
        >
          <div className="coin-inner">
            <div className="coin-shine" />
            <span className="coin-symbol">💰</span>
          </div>
        </div>
      </div>

      <div className="tap-footer">
        <div className="energy-stats" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--game-coin-primary)' }}>
          <span>⚡ {Math.floor(energy)}</span>
          <span style={{ color: 'var(--tg-theme-hint-color, #8b8fa3)' }}>/ {maxEnergy}</span>
        </div>
        <div className="energy-bar">
          <div className="energy-fill" style={{ width: `${energyPercent}%`, transition: 'width 0.3s ease-out' }} />
        </div>
      </div>

      {showProfile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: 'var(--game-surface)', padding: '24px', borderRadius: '24px', width: '100%', maxWidth: '340px' }}>
            <h2 style={{ margin: '0 0 16px', textAlign: 'center' }}>Player Profile</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--tg-theme-hint-color)' }}>League</span>
                <span style={{ fontWeight: 'bold', color: currentLeague.color }}>{currentLeague.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--tg-theme-hint-color)' }}>Tap Power</span>
                <span style={{ fontWeight: 'bold' }}>+{tapPower}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ color: 'var(--tg-theme-hint-color)' }}>Wallet</span>
                {wallet ? (
                  <span style={{ fontWeight: 'bold', color: 'var(--game-success)' }}>
                    {wallet.account.address.slice(0, 6)}...{wallet.account.address.slice(-4)}
                  </span>
                ) : (
                  <span style={{ color: 'var(--tg-theme-hint-color)' }}>Not connected</span>
                )}
              </div>
              
              {wallet && (
                <button 
                  onClick={() => tonConnectUI.disconnect()}
                  style={{ padding: '12px', borderRadius: '12px', border: 'none', background: 'var(--game-surface-alpha)', color: 'var(--game-error, #ff4d4d)', fontWeight: 'bold' }}
                >
                  Disconnect Wallet
                </button>
              )}
              <button 
                onClick={() => setShowProfile(false)}
                style={{ padding: '12px', borderRadius: '12px', border: 'none', background: 'var(--game-accent)', color: '#fff', fontWeight: 'bold' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
