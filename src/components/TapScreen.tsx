import { useCallback, useRef, type MouseEvent } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { useTelegram } from '../hooks/useTelegram';
import './TapScreen.css';

export function TapScreen() {
  const balance = useGameStore((s) => s.balance);
  const incrementBalance = useGameStore((s) => s.incrementBalance);
  const { hapticFeedback } = useTelegram();
  const coinRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTap = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      incrementBalance();
      hapticFeedback();

      // Spawn flying +1 at click coordinates
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const particle = document.createElement('div');
      particle.className = 'tap-particle';
      particle.textContent = '+1';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;

      container.appendChild(particle);

      // Remove from DOM after animation completes to prevent memory leaks
      particle.addEventListener('animationend', () => {
        particle.remove();
      });
    },
    [incrementBalance, hapticFeedback]
  );

  const formatBalance = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="tap-screen" ref={containerRef}>
      <div className="tap-header">
        <div className="balance-label">Your Balance</div>
        <div className="balance-value">
          <span className="balance-icon">🪙</span>
          <span className="balance-number">{formatBalance(balance)}</span>
        </div>
      </div>

      <div className="coin-area">
        <div className="coin-glow" />
        <div
          ref={coinRef}
          className="coin"
          onClick={handleTap}
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
        <div className="energy-bar">
          <div className="energy-fill" />
        </div>
        <p className="tap-hint">Tap the coin to earn points!</p>
      </div>
    </div>
  );
}
