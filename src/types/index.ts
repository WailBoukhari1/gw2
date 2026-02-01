export interface GW2Item {
  id: number;
  chat_link: string;
  name: string;
  icon?: string;
  description?: string;
  type: string;
  rarity: string;
  level: number;
  vendor_value: number;
  default_skin?: number;
  flags: string[];
  game_types: string[];
  restrictions: string[];
}

export interface GW2Price {
  id: number;
  whitelisted: boolean;
  buys: {
    quantity: number;
    unit_price: number;
  };
  sells: {
    quantity: number;
    unit_price: number;
  };
}

export interface MarketItem extends GW2Item {
  buyPrice: number;
  sellPrice: number;
  profitPerUnit: number;
  profitPercentage: number;
  buysQty: number;
  sellsQty: number;
  flipTime: string;
  priorityScore: number;
  roi: number;
  isPinned?: boolean;
  isManipulated?: boolean;
  liquidityScore?: number;
  
  // Scouting Metrics
  sold24h?: number;
  bought24h?: number;
  offersCount?: number;
  bidsCount?: number;
  supplyChange24h?: number;
  demandChange24h?: number;
}

export interface SearchResult {
  id: number;
  name: string;
  icon: string;
}

export interface WalletCurrency {
  id: number;
  value: number;
}

export interface InventoryItem {
  id: number;
  count: number;
  binding?: string;
}

export interface AccountInfo {
  name: string;
  age: number;
  world: number;
  guilds: string[];
  created: string;
  access: string[];
  commander: boolean;
  fractal_level?: number;
  daily_ap?: number;
  monthly_ap?: number;
  wvw_rank?: number;
}
export interface Position {
  itemId: number;
  itemName: string;
  itemIcon: string;
  buyPrice: number;
  quantity: number;
  timestamp: string;
  
  // Enhanced tracking fields
  type: 'buy' | 'sell'; // Are we buying to flip, or selling inventory?
  status: 'active' | 'partial' | 'completed' | 'holding' | 'planning'; // Trade completion status
  
  // For completed positions
  sellPrice?: number; // Actual sell price when completed
  sellTimestamp?: string; // When the position was closed
  realizedProfit?: number; // Actual profit after fees
  quantitySold?: number; // How many units were sold (for partial fills)
  originalQuantity?: number; // The initial total quantity when the position was created
}

export interface InvestmentPlan {
  id: string;
  itemId: number;
  itemName: string;
  itemIcon: string;
  targetQty: number;
  targetBuyPrice: number;
  currentOwnedQty: number;
  status: 'planning' | 'active' | 'completed';
  timestamp: string;
  reasoning: string;
}
export interface ShadowPosition {
  id: string;
  itemId: number;
  itemName: string;
  itemIcon: string;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  entryTimestamp: string;
  expectedExitTimestamp: string;
  status: 'active' | 'completed';
  roiEstimate: number;
  liquidityScore?: number;
}
