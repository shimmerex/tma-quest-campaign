import { useGameStore } from '../stores/useGameStore';
import { useTelegram } from '../hooks/useTelegram';
import './BoostsScreen.css';

export function BoostsScreen() {
  const balance = useGameStore((s) => s.balance);
  const upgrades = useGameStore((s) => s.upgrades);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);
  const { hapticFeedback, hapticSuccess } = useTelegram();

  const handleBuy = (id: string, cost: number) => {
    if (balance >= cost) {
      buyUpgrade(id);
      hapticSuccess();
    } else {
      hapticFeedback(); // error bump
    }
  };

  return (
    <div className="boosts-screen">
      <div className="boosts-header">
        <h1 className="boosts-title">Upgrades</h1>
        <div className="boosts-balance">🪙 {balance.toLocaleString()}</div>
      </div>
      
      <div className="boosts-list">
        {upgrades.map((u) => {
          const currentCost = Math.floor(u.baseCost * Math.pow(u.costMultiplier, u.level));
          const canAfford = balance >= currentCost;
          
          return (
            <div key={u.id} className="boost-card">
              <div className="boost-icon-wrapper">{u.icon}</div>
              <div className="boost-info">
                <h3 className="boost-name">{u.name} <span className="boost-level">Lvl {u.level}</span></h3>
                <p className="boost-description">{u.description}</p>
                <div className="boost-effect">+{u.effectBase} {u.effectType}</div>
              </div>
              <button 
                className={`boost-action ${canAfford ? '' : 'boost-action-disabled'}`}
                onClick={() => handleBuy(u.id, currentCost)}
                disabled={!canAfford}
              >
                🪙 {currentCost.toLocaleString()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
