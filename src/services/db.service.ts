import Dexie, { type Table } from 'dexie';
import type { MarketItem } from '../types';

export class MarketDatabase extends Dexie {
  items!: Table<MarketItem>;

  constructor() {
    super('MarketDatabase');
    this.version(1).stores({
      items: 'id, name, rarity, priorityScore' // Primary key is id
    });
  }
}

export const db = new MarketDatabase();
