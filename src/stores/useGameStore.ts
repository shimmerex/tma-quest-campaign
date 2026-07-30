import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Simple hash function for anti-cheat signature
const hashState = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};

const secureStorage = {
  getItem: (name: string) => {
    const item = localStorage.getItem(name);
    if (!item) return null;
    try {
      const parsed = JSON.parse(atob(item));
      if (parsed.signature !== hashState(JSON.stringify(parsed.state))) {
        console.error('State tampering detected, resetting progress.');
        return null;
      }
      return JSON.stringify(parsed.state);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    const stateObj = JSON.parse(value);
    const signature = hashState(value);
    const securePayload = btoa(JSON.stringify({ state: stateObj, signature }));
    localStorage.setItem(name, securePayload);
  },
  removeItem: (name: string) => localStorage.removeItem(name),
};

export interface Quest {
  id: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  icon: string;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  level: number;
  baseCost: number;
  costMultiplier: number;
  effectType: 'tapPower' | 'energyLimit' | 'regenSpeed' | 'profitPerHour';
  effectBase: number;
  icon: string;
}

interface GameState {
  balance: number;
  energy: number;
  maxEnergy: number;
  tapPower: number;
  energyRegenRate: number;
  profitPerHour: number;
  lastEnergyUpdate: number;
  quests: Quest[];
  upgrades: Upgrade[];
  offlineEarnings: number;
  lastLogin: number;
  hasOnboarded: boolean;
  isProcessing: boolean;
  incrementBalance: () => void;
  claimOfflineEarnings: () => void;
  completeOnboarding: () => void;
  completeQuest: (id: string) => void;
  buyUpgrade: (id: string) => void;
  consumeEnergy: () => boolean;
  regenEnergy: () => void;
  refillEnergy: () => void;
  calculateSecureOfflineEarnings: () => Promise<void>;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      balance: 0,
      energy: 1000,
      maxEnergy: 1000,
      tapPower: 1,
      energyRegenRate: 1,
      profitPerHour: 0,
      lastEnergyUpdate: Date.now(),
      lastLogin: Date.now(),
      offlineEarnings: 0,
      hasOnboarded: false,
      isProcessing: false,
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
        set((state) => ({ balance: state.balance + state.tapPower })),
      consumeEnergy: () => {
        const { energy, tapPower } = get();
        if (energy >= tapPower) {
          set({ energy: energy - tapPower });
          return true;
        }
        return false;
      },
      regenEnergy: () =>
        set((state) => {
          const now = Date.now();
          const secondsPassed = Math.floor((now - state.lastEnergyUpdate) / 1000);
          if (secondsPassed > 0) {
            const newEnergy = Math.min(
              state.maxEnergy,
              state.energy + secondsPassed * state.energyRegenRate
            );
            return { energy: newEnergy, lastEnergyUpdate: now };
          }
          return state;
        }),
      refillEnergy: () => set((state) => ({ energy: state.maxEnergy })),
      upgrades: [
        {
          id: 'multitap',
          name: 'Multi-Tap',
          description: 'Increase points per tap',
          level: 0,
          baseCost: 100,
          costMultiplier: 2,
          effectType: 'tapPower',
          effectBase: 1,
          icon: '👆',
        },
        {
          id: 'energy-limit',
          name: 'Energy Limit',
          description: 'Increase maximum energy',
          level: 0,
          baseCost: 150,
          costMultiplier: 1.5,
          effectType: 'energyLimit',
          effectBase: 500,
          icon: '🔋',
        },
        {
          id: 'recharge-speed',
          name: 'Recharge Speed',
          description: 'Faster energy regeneration',
          level: 0,
          baseCost: 200,
          costMultiplier: 2.5,
          effectType: 'regenSpeed',
          effectBase: 1,
          icon: '⚡',
        },
        {
          id: 'auto-bot',
          name: 'Auto Bot',
          description: 'Passive income per hour',
          level: 0,
          baseCost: 500,
          costMultiplier: 1.8,
          effectType: 'profitPerHour',
          effectBase: 100,
          icon: '🤖',
        },
      ],
      buyUpgrade: (id: string) =>
        set((state) => {
          if (state.isProcessing) return state; // Transaction lock to prevent double-spending
          const upgrade = state.upgrades.find((u) => u.id === id);
          if (!upgrade) return state;

          const currentCost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
          if (state.balance < currentCost) return state;

          set({ isProcessing: true }); // Lock

          const newLevel = upgrade.level + 1;
          const newUpgrades = state.upgrades.map((u) =>
            u.id === id ? { ...u, level: newLevel } : u
          );

          let newTapPower = state.tapPower;
          let newMaxEnergy = state.maxEnergy;
          let newRegenRate = state.energyRegenRate;
          let newProfitPerHour = state.profitPerHour;

          if (upgrade.effectType === 'tapPower') {
            newTapPower += upgrade.effectBase;
          } else if (upgrade.effectType === 'energyLimit') {
            newMaxEnergy += upgrade.effectBase;
          } else if (upgrade.effectType === 'regenSpeed') {
            newRegenRate += upgrade.effectBase;
          } else if (upgrade.effectType === 'profitPerHour') {
            newProfitPerHour += upgrade.effectBase;
          }

          return {
            balance: state.balance - currentCost,
            upgrades: newUpgrades,
            tapPower: newTapPower,
            maxEnergy: newMaxEnergy,
            energyRegenRate: newRegenRate,
            profitPerHour: newProfitPerHour,
            isProcessing: false, // Unlock
          };
        }),
      completeQuest: (id: string) =>
        set((state) => {
          if (state.isProcessing) return state;
          const quest = state.quests.find((q) => q.id === id);
          if (!quest || quest.completed) return state;
          
          set({ isProcessing: true });
          return {
            quests: state.quests.map((q) =>
              q.id === id ? { ...q, completed: true } : q
            ),
            balance: state.balance + quest.reward,
            isProcessing: false,
          };
        }),
      claimOfflineEarnings: () =>
        set((state) => ({
          balance: state.balance + state.offlineEarnings,
          offlineEarnings: 0,
        })),
      completeOnboarding: () =>
        set((state) => {
          if (state.hasOnboarded) return state;
          return { hasOnboarded: true, balance: state.balance + 1000 };
        }),
      calculateSecureOfflineEarnings: async () => {
        const state = get();
        if (state.profitPerHour <= 0) return;
        
        try {
          // Fetch secure time to prevent local clock manipulation
          const res = await fetch('http://worldtimeapi.org/api/timezone/Etc/UTC');
          const data = await res.json();
          const serverTime = new Date(data.utc_datetime).getTime();
          
          const hoursPassed = (serverTime - state.lastLogin) / (1000 * 60 * 60);
          const cappedHours = Math.max(0, Math.min(hoursPassed, 12));
          const earned = Math.floor(state.profitPerHour * cappedHours);
          
          if (earned > 0) {
            set({ offlineEarnings: earned, lastLogin: serverTime });
          } else {
            set({ lastLogin: serverTime });
          }
        } catch (e) {
          // Fallback if API fails, but prevent exploits by not rewarding huge gaps
          console.warn('Failed to fetch secure time');
          set({ lastLogin: Date.now() });
        }
      },
    }),
    {
      name: 'tma-quest-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
