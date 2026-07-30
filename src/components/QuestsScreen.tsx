import { useGameStore } from '../stores/useGameStore';
import { useTelegram } from '../hooks/useTelegram';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useEffect } from 'react';
import type { Quest } from '../stores/useGameStore';
import './QuestsScreen.css';

export function QuestsScreen() {
  const quests = useGameStore((s) => s.quests);
  const completeQuest = useGameStore((s) => s.completeQuest);
  const { hapticSuccess } = useTelegram();
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  // Auto-complete wallet quest when wallet is connected
  useEffect(() => {
    const walletQuest = quests.find((q) => q.id === 'connect-wallet');
    if (wallet && walletQuest && !walletQuest.completed) {
      completeQuest('connect-wallet');
      hapticSuccess();
    }
  }, [wallet, quests, completeQuest, hapticSuccess]);

  const handleQuestAction = (quest: Quest) => {
    if (quest.completed) return;

    if (quest.id === 'connect-wallet') {
      tonConnectUI.openModal();
    } else {
      // For demo quests, mark as complete directly
      completeQuest(quest.id);
      hapticSuccess();
    }
  };

  const completedCount = quests.filter((q) => q.completed).length;

  return (
    <div className="quests-screen">
      <div className="quests-header">
        <h1 className="quests-title">Quests</h1>
        <div className="quests-progress">
          <span className="quests-progress-text">
            {completedCount}/{quests.length} completed
          </span>
          <div className="quests-progress-bar">
            <div
              className="quests-progress-fill"
              style={{ width: `${(completedCount / quests.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="daily-streak">
        <h2 className="section-title">Daily Streak</h2>
        <div className="streak-days">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <div key={day} className={`streak-day ${day === 3 ? 'streak-day-active' : ''} ${day < 3 ? 'streak-day-done' : ''}`}>
              <div className="streak-day-label">Day {day}</div>
              <div className="streak-day-reward">🪙</div>
            </div>
          ))}
        </div>
      </div>

      <h2 className="section-title" style={{ marginTop: '24px' }}>Tasks</h2>
      <div className="quest-list">
        {quests.map((quest) => (
          <div
            key={quest.id}
            className={`quest-card ${quest.completed ? 'quest-completed' : ''}`}
            id={`quest-${quest.id}`}
          >
            <div className="quest-icon-wrapper">
              <span className="quest-icon">{quest.icon}</span>
            </div>
            <div className="quest-info">
              <h3 className="quest-name">{quest.title}</h3>
              <p className="quest-description">{quest.description}</p>
              <div className="quest-reward">
                <span className="quest-reward-icon">🪙</span>
                <span className="quest-reward-amount">+{quest.reward}</span>
              </div>
            </div>
            <button
              type="button"
              className={`quest-action ${quest.completed ? 'quest-action-done' : ''}`}
              onClick={() => handleQuestAction(quest)}
              disabled={quest.completed}
              id={`quest-btn-${quest.id}`}
            >
              {quest.completed ? '✓' : 'Go'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
