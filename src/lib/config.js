import fs from 'fs';
import path from 'path';
import prisma from '@/lib/db';

const configPath = path.join(process.cwd(), 'src/lib/config.json');

export const DEFAULT_CONFIG = {
  // Payment details must be configured by an admin before they are shown to players.
  upiId: '',
  payeeName: '',
  regFee: '500',
  auctionStatus: 'NOT_STARTED',
};

export const VALID_AUCTION_STATUSES = ['NOT_STARTED', 'LIVE', 'BREAK', 'PAUSED', 'ENDED'];

export async function readConfig() {
  try {
    const rows = await prisma.systemConfig.findMany();
    if (rows && rows.length > 0) {
      const config = { ...DEFAULT_CONFIG };
      for (const row of rows) {
        if (row.value !== undefined && row.value !== null) {
          config[row.key] = row.value;
        }
      }
      return config;
    }
  } catch (e) {
    console.error('Error reading config from database:', e);
  }

  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('Error reading config file:', e);
  }
  return { ...DEFAULT_CONFIG };
}

export async function writeConfig(config) {
  try {
    const entries = Object.entries(config);
    for (const [key, value] of entries) {
      if (value !== undefined && value !== null) {
        await prisma.systemConfig.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        });
      }
    }
  } catch (e) {
    console.error('Error writing config to database:', e);
  }

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  } catch (e) {
    // Ignore file write errors on read-only/ephemeral filesystems
  }
}
