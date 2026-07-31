import { create } from 'zustand';

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
  tgId: string;
  username: string;
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
  pendingTaps: number;
  setTgId: (id: string, username: string) => void;
  syncWithServer: () => Promise<void>;
  syncTaps: () => Promise<void>;
  claimOfflineEarnings: () => void;
  completeOnboarding: () => void;
  completeQuest: (id: string) => void;
  buyUpgrade: (id: string) => void;
  consumeEnergy: () => boolean;
  regenEnergy: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const DEFAULT_UPGRADES: Upgrade[] = [
  { id: 'multitap', name: 'Multi-Tap', description: 'Increase points per tap', level: 0, baseCost: 100, costMultiplier: 2, effectType: 'tapPower', effectBase: 1, icon: '👆' },
  { id: 'energy-limit', name: 'Energy Limit', description: 'Increase maximum energy', level: 0, baseCost: 150, costMultiplier: 1.5, effectType: 'energyLimit', effectBase: 500, icon: '🔋' },
  { id: 'recharge-speed', name: 'Recharge Speed', description: 'Faster energy regeneration', level: 0, baseCost: 200, costMultiplier: 2.5, effectType: 'regenSpeed', effectBase: 1, icon: '⚡' },
  { id: 'auto-bot', name: 'Auto Bot', description: 'Passive income per hour', level: 0, baseCost: 500, costMultiplier: 1.8, effectType: 'profitPerHour', effectBase: 100, icon: '🤖' }
];

export const useGameStore = create<GameState>((set, get) => ({
  tgId: 'mock-user-123',
  username: 'MockUser',
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
  pendingTaps: 0,
  quests: [
    { id: 'connect-wallet', title: 'Connect Wallet', description: 'Link your TON wallet', reward: 500, completed: false, icon: '💎' },
    { id: 'daily-bonus', title: 'Daily Bonus', description: 'Claim daily reward', reward: 100, completed: false, icon: '🎁' },
  ],
  upgrades: DEFAULT_UPGRADES,

  setTgId: (id: string, username: string) => set({ tgId: id, username }),

  syncWithServer: async () => {
    const { tgId, username } = get();
    try {
      const res = await fetch(`${API_URL}/auth/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tgId, username })
      });
      const data = await res.json();
      if (data.user) {
        // Merge server user state with local upgrades state
        const serverUpgrades = data.user.upgrades || [];
        const mergedUpgrades = DEFAULT_UPGRADES.map(def => {
          const s = serverUpgrades.find((u: any) => u.upgradeId === def.id);
          return s ? { ...def, level: s.level } : def;
        });

        set({
          balance: data.user.balance,
          energy: data.user.energy,
          maxEnergy: data.user.maxEnergy,
          tapPower: data.user.tapPower,
          energyRegenRate: data.user.energyRegenRate,
          profitPerHour: data.user.profitPerHour,
          offlineEarnings: data.offlineEarnings,
          lastLogin: new Date(data.user.lastLogin).getTime(),
          lastEnergyUpdate: Date.now(),
          upgrades: mergedUpgrades
        });
      }
    } catch (e) {
      console.error('Failed to sync with server:', e);
    }
  },

  syncTaps: async () => {
    const { tgId, pendingTaps } = get();
    if (pendingTaps === 0) return;

    try {
      // Reset pending before sending to catch new taps during flight
      set({ pendingTaps: 0 }); 
      const res = await fetch(`${API_URL}/game/tap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tgId, tapCount: pendingTaps })
      });
      
      const data = await res.json();
      if (res.ok && data.user) {
        set({
          balance: data.user.balance,
          energy: data.user.energy
        });
      } else {
        // If it failed (e.g. out of energy on server), revert state sync
        get().syncWithServer();
      }
    } catch (e) {
      console.error('Failed to sync taps:', e);
      // Re-queue taps
      set((s) => ({ pendingTaps: s.pendingTaps + pendingTaps }));
    }
  },

  consumeEnergy: () => {
    const { energy, tapPower } = get();
    if (energy >= tapPower) {
      set((s) => ({ 
        energy: s.energy - s.tapPower,
        balance: s.balance + s.tapPower, // Optimistic UI
        pendingTaps: s.pendingTaps + 1 
      }));
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

  buyUpgrade: async (id: string) => {
    const state = get();
    if (state.isProcessing) return;
    const upgrade = state.upgrades.find(u => u.id === id);
    if (!upgrade) return;

    set({ isProcessing: true });
    try {
      const res = await fetch(`${API_URL}/game/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tgId: state.tgId,
          upgradeId: id,
          baseCost: upgrade.baseCost,
          costMultiplier: upgrade.costMultiplier,
          effectType: upgrade.effectType,
          effectBase: upgrade.effectBase
        })
      });

      if (res.ok) {
        // Sync entire state on success
        await get().syncWithServer();
      } else {
        const err = await res.json();
        console.error('Buy error:', err);
      }
    } catch (e) {
      console.error('Failed to buy upgrade:', e);
    } finally {
      set({ isProcessing: false });
    }
  },

  claimOfflineEarnings: () => {
    // Already calculated securely by server on auth/sync, just clear modal visually
    set({ offlineEarnings: 0 });
  },

  completeOnboarding: () => set({ hasOnboarded: true }),
  completeQuest: (id: string) => set(s => ({ quests: s.quests.map(q => q.id === id ? { ...q, completed: true } : q) }))
}));
