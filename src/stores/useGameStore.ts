import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Quest {
  id: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  icon: string;
}

interface GameState {
  balance: number;
  quests: Quest[];
  incrementBalance: () => void;
  completeQuest: (id: string) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      balance: 0,
      quests: [
        {
          id: 'connect-wallet',
          title: 'Connect Wallet',
          description: 'Link your TON wallet to earn rewards',
          reward: 500,
          completed: false,
          icon: '💎',
        },
        {
          id: 'subscribe-channel',
          title: 'Join Channel',
          description: 'Subscribe to our Telegram channel',
          reward: 200,
          completed: false,
          icon: '📢',
        },
        {
          id: 'invite-friend',
          title: 'Invite a Friend',
          description: 'Share the app with a friend',
          reward: 300,
          completed: false,
          icon: '👥',
        },
        {
          id: 'daily-bonus',
          title: 'Daily Bonus',
          description: 'Claim your daily login reward',
          reward: 100,
          completed: false,
          icon: '🎁',
        },
      ],
      incrementBalance: () =>
        set((state) => ({ balance: state.balance + 1 })),
      completeQuest: (id: string) =>
        set((state) => {
          const quest = state.quests.find((q) => q.id === id);
          if (!quest || quest.completed) return state;
          return {
            quests: state.quests.map((q) =>
              q.id === id ? { ...q, completed: true } : q
            ),
            balance: state.balance + quest.reward,
          };
        }),
    }),
    {
      name: 'tma-quest-storage',
    }
  )
);
