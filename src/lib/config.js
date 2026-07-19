import fs from 'fs';
import path from 'path';

const configPath = path.join(process.cwd(), 'src/lib/config.json');

export const DEFAULT_CONFIG = {
  upiId: 'evenzo@okaxis',
  payeeName: 'JCI Premier League',
  regFee: '500',
  auctionStatus: 'NOT_STARTED',
};

export const VALID_AUCTION_STATUSES = ['NOT_STARTED', 'LIVE', 'BREAK', 'PAUSED', 'ENDED'];

export function readConfig() {
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

export function writeConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
}
