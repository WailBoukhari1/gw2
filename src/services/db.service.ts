import Dexie, { type Table } from 'dexie';
import type { MarketItem } from '../types';

export class MarketDatabase extends Dexie {
  items!: Table<MarketItem>;
  aiResults!: Table<{ itemId: number; timestamp: number; data: any; }>;
  tradeHistory!: Table<any>;
  notifications!: Table<any>;

  constructor() {
    super('MarketDatabase');
    this.version(2).stores({
      items: 'id, name, rarity, priorityScore',
      aiResults: 'itemId, timestamp',
      tradeHistory: 'id, item_id, price, purchased, created', // Store full trade history
      notifications: 'id, type, timestamp' // Store trade alerts
    });
  }
}

export const db = new MarketDatabase();
