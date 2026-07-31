import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
});
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Basic healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Sync / Auth Endpoint
app.post('/api/auth/sync', async (req, res) => {
  try {
    const { initData, tgId, username } = req.body;
    
    // In production, validate initData via HMAC-SHA-256 against Telegram Bot Token
    if (!tgId) {
      return res.status(400).json({ error: 'Missing telegram ID' });
    }

    let user = await prisma.user.findUnique({
      where: { id: tgId },
      include: { upgrades: true, quests: true }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: tgId,
          username: username,
        },
        include: { upgrades: true, quests: true }
      });
      return res.json({ user, offlineEarnings: 0 });
    }

    // Calculate offline earnings securely
    const now = new Date();
    const hoursPassed = (now.getTime() - user.lastLogin.getTime()) / (1000 * 60 * 60);
    const cappedHours = Math.max(0, Math.min(hoursPassed, 12));
    const offlineEarnings = Math.floor(user.profitPerHour * cappedHours);
    
    // Update lastLogin
    const updatedUser = await prisma.user.update({
      where: { id: tgId },
      data: { 
        lastLogin: now,
        balance: user.balance + offlineEarnings
      },
      include: { upgrades: true, quests: true }
    });

    res.json({ user: updatedUser, offlineEarnings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Tap Endpoint
app.post('/api/game/tap', async (req, res) => {
  try {
    const { tgId, tapCount } = req.body; // e.g. 50 taps batched
    if (!tgId || !tapCount) return res.status(400).json({ error: 'Invalid payload' });

    const user = await prisma.user.findUnique({ where: { id: tgId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Calculate how much energy should have regenerated since last tap
    const now = new Date();
    const secondsPassed = Math.floor((now.getTime() - user.lastLogin.getTime()) / 1000);
    const regeneratedEnergy = Math.min(
      user.maxEnergy,
      user.energy + (secondsPassed * user.energyRegenRate)
    );

    const totalCost = tapCount * user.tapPower;
    
    if (regeneratedEnergy < totalCost) {
      return res.status(400).json({ error: 'Insufficient energy', trueState: user });
    }

    const updatedUser = await prisma.user.update({
      where: { id: tgId },
      data: {
        balance: user.balance + totalCost,
        energy: regeneratedEnergy - totalCost,
        lastLogin: now
      }
    });

    res.json({ user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Buy Upgrade Endpoint
app.post('/api/game/upgrade', async (req, res) => {
  try {
    const { tgId, upgradeId, baseCost, costMultiplier, effectType, effectBase } = req.body;
    
    const user = await prisma.user.findUnique({ 
      where: { id: tgId },
      include: { upgrades: true }
    });
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    const userUpgrade = user.upgrades.find((u: { upgradeId: string }) => u.upgradeId === upgradeId);
    const currentLevel = userUpgrade ? userUpgrade.level : 0;
    
    // Server calculates true cost
    const cost = Math.floor(baseCost * Math.pow(costMultiplier, currentLevel));
    
    if (user.balance < cost) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    // Apply effect
    let newTapPower = user.tapPower;
    let newMaxEnergy = user.maxEnergy;
    let newRegenRate = user.energyRegenRate;
    let newProfitPerHour = user.profitPerHour;

    if (effectType === 'tapPower') newTapPower += effectBase;
    if (effectType === 'energyLimit') newMaxEnergy += effectBase;
    if (effectType === 'regenSpeed') newRegenRate += effectBase;
    if (effectType === 'profitPerHour') newProfitPerHour += effectBase;

    // Transaction
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: tgId },
        data: {
          balance: user.balance - cost,
          tapPower: newTapPower,
          maxEnergy: newMaxEnergy,
          energyRegenRate: newRegenRate,
          profitPerHour: newProfitPerHour
        },
        include: { upgrades: true }
      }),
      prisma.userUpgrade.upsert({
        where: {
          userId_upgradeId: { userId: tgId, upgradeId }
        },
        update: { level: currentLevel + 1 },
        create: {
          userId: tgId,
          upgradeId,
          level: 1
        }
      })
    ]);

    res.json({ user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 TMA Backend running on http://localhost:${PORT}`);
});
