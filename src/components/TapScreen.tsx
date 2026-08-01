import React, { useCallback, useRef, useState } from 'react';
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
  const { hapticFeedback } = useTelegram();
  const coinRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [showProfile, setShowProfile] = useState(false);
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  const handleTap = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Prevent default text selection
      e.preventDefault();

      if (!consumeEnergy()) {
        hapticFeedback();
        return;
      }

      hapticFeedback();
      
      const activeParticles = document.querySelectorAll('.tap-particle');
      if (activeParticles.length > 20) {
        activeParticles[0].remove();
      }

      const coin = document.createElement('div');
      coin.className = 'tap-particle';
      coin.textContent = `+${tapPower}`;
      
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        // Add random scatter for organic feel
        const scatterX = (Math.random() - 0.5) * 40;
        const scatterY = (Math.random() - 0.5) * 40;
        const rotation = (Math.random() - 0.5) * 30;
        
        coin.style.left = `${e.clientX - rect.left + scatterX}px`;
        coin.style.top = `${e.clientY - rect.top + scatterY}px`;
        coin.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
      }
      
      containerRef.current?.appendChild(coin);
      
      coin.addEventListener('animationend', () => {
        coin.remove();
      });

      if (coinRef.current) {
        // More aggressive 3D push effect
        coinRef.current.style.transform = `scale(0.92) translateY(4px) rotateX(10deg)`;
        setTimeout(() => {
          if (coinRef.current) coinRef.current.style.transform = 'scale(1) translateY(0) rotateX(0)';
        }, 80);
      }
    },
    [consumeEnergy, hapticFeedback, tapPower]
  );

  const formatBalance = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
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
      <div className="tap-header-v2">
        <div className="header-top-row">
          <button className="profile-badge-btn" onClick={() => setShowProfile(true)}>
            <div className="avatar-circle">🧑‍🚀</div>
            <div className="user-info-stack">
              <span className="username-label">Player</span>
              <span className="league-label" style={{ color: currentLeague.color }}>
                {currentLeague.name} ›
              </span>
            </div>
          </button>
          
          <div className="profit-badge">
            <span className="profit-label">Profit per hour</span>
            <span className="profit-val">+{useGameStore(s => s.profitPerHour)}</span>
          </div>
        </div>

        <div className="balance-display-v2">
          <span className="balance-icon-huge">🪙</span>
          <span className="balance-val-huge">{formatBalance(balance)}</span>
        </div>
        
        {nextLeague && (
          <div className="league-tracker">
            <div className="tracker-labels">
              <span>{currentLeague.name}</span>
              <span>{leagueProgress.toFixed(1)}%</span>
            </div>
            <div className="tracker-bar">
              <div className="tracker-fill" style={{ width: `${leagueProgress}%`, background: currentLeague.color }} />
            </div>
          </div>
        )}
      </div>

      <div className="coin-interaction-area">
        <div className="coin-glow-v2" />
        <div
          ref={coinRef}
          className={`tap-coin-v2 ${!hasEnergy ? 'disabled' : ''}`}
          onPointerDown={handleTap}
        >
          <div className="coin-surface">
            <div className="coin-shine-v2" />
            <div className="coin-logo">💰</div>
          </div>
        </div>
      </div>

      <div className="tap-footer-v2">
        <div className="energy-stats-v2">
          <span className="energy-icon">⚡</span>
          <span className="energy-current">{Math.floor(energy)}</span>
          <span className="energy-max">/ {maxEnergy}</span>
        </div>
        <div className="energy-bar-v2">
          <div className="energy-fill-v2" style={{ width: `${energyPercent}%` }} />
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
