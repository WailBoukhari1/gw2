import type { MarketItem } from '../types';

export const STRATEGIES = {
  getFlipRecommendation(item: MarketItem) {
    const isHighVolume = item.buysQty > 1000;
    const margin = (item.sellPrice - item.buyPrice) / item.buyPrice;
    
    // 1 Copper Strategy
    if (margin > 0.15 && isHighVolume) {
      return {
        strategy: '1 Copper Undercut',
        action: 'Buy Order: Match top + 1c',
        confidence: 'High',
        description: 'High volume item with good margin. Place buy order 1c above current highest.'
      };
    }
    
    // Bulk Flip
    if (item.buyPrice < 1000 && isHighVolume) {
       return {
         strategy: 'Bulk Volume Flip',
         action: 'Buy Stack (250)',
         confidence: 'Medium',
         description: 'Low cost item, flip in bulk for consistent small profit.'
       };
    }
    
    if (item.roi > 50 && !isHighVolume) {
      return {
        strategy: 'Long Hold / High ROI',
        action: 'Lowball Buy Order',
        confidence: 'Low',
        description: 'High risk, high reward. Place low buy order and wait.'
      };
    }

    return null;
  }
};

export const META_EVENTS = [
  {
    name: 'Octovine (Auric Basin)',
    time: 'Odd Hours (UTC)',
    gph: 35,
    difficulty: 'Medium',
    rewards: ['Amalgamated Genstones', 'Ectoplasm']
  },
  {
    name: 'Dragonstream (Drizzlewood)',
    time: 'Anytime',
    gph: 30,
    difficulty: 'Easy',
    rewards: ['Materials', 'Unid Gear']
  },
  {
    name: 'Fishing (Seitung)',
    time: 'Anytime',
    gph: 38,
    difficulty: 'Hard',
    rewards: ['Ambergris', 'Rare Fish']
  }
];

export const FRACTAL_TIERS = [
  {
    tier: 'T1 (1-25)',
    gph: 15,
    difficulty: 'Easy',
    rewards: ['Liquid Gold', 'Fractal Encryptions'],
    duration: '30min'
  },
  {
    tier: 'T4 (76-100)',
    gph: 23,
    difficulty: 'Hard',
    rewards: ['High Liquid Gold', 'Ascended Boxes'],
    duration: '60min'
  },
  {
    tier: 'T4 + CMs',
    gph: 25,
    difficulty: 'Very Hard',
    rewards: ['Max Daily Gold', 'Titles'],
    duration: '90min'
  }
];

export const FISHING_LOCATIONS = [
  {
    location: 'New Kaineng City',
    hotspot: 'Ambergris Nodes',
    gph: 38,
    requirements: ['Max Mastery', 'Special Bait'],
    strategy: 'Deep water nodes focus'
  },
  {
    location: 'Seitung Province',
    hotspot: 'Saltwater',
    gph: 27,
    requirements: ['Basic Mastery'],
    strategy: 'Casual fishing'
  }
];

export const LEGENDARY_PROFITS = [
  {
    name: 'Twilight (Gen 1)',
    profit: 650,
    craftingTime: '4w',
    investment: 2100,
    sellPrice: 2750
  },
  {
    name: 'Aurene\'s Breath (Gen 3)',
    profit: 300,
    craftingTime: '2w',
    investment: 2400,
    sellPrice: 2700
  },
  {
    name: 'Bolt (Gen 1)',
    profit: 580,
    craftingTime: '4w',
    investment: 2000,
    sellPrice: 2580
  }
];

export const EVENT_SPECULATION = [
  {
    event: 'Festival of the Four Winds',
    date: 'Early August',
    items: ['Zephyrite Supply Box', 'Materials'],
    action: 'Stockpile T5/T6 Mats',
    confidence: 'High'
  },
  {
    event: 'Halloween (Mad King)',
    date: 'October',
    items: ['Candy Corn', 'Plastic Fangs'],
    action: 'Sell during first week',
    confidence: 'Very High'
  },
  {
    event: 'Wintersday',
    date: 'December',
    items: ['Snowflakes', 'Winter\'s Presence'],
    action: 'Buy drink ingredients now',
    confidence: 'Medium'
  }
];

export const MATERIAL_PROMOTIONS = [
  {
    name: 'T5 -> T6 Blood',
    input: 'Potent Blood',
    output: 'Powerful Blood',
    spiritShards: 10,
    profitPerShard: 0.85,
    difficulty: 'Medium'
  },
  {
    name: 'T5 -> T6 Totems',
    input: 'Large Totem',
    output: 'Elaborate Totem',
    spiritShards: 10,
    profitPerShard: 0.60,
    difficulty: 'Medium'
  },
  {
    name: 'Lodestone Promotion',
    input: 'Cores',
    output: 'Lodestones',
    spiritShards: 2,
    profitPerShard: 0.40,
    difficulty: 'Easy'
  }
];

export const SALVAGE_STRATEGIES = [
  {
    item: 'Unidentified Gear (Green)',
    action: 'Open -> Salvage Rares -> Sell Mats',
    expectedValue: 1.85, // silver per piece
    tool: 'Runecrafter\'s Salvage-o-Matic'
  },
  {
    item: 'Unidentified Gear (Yellow)',
    action: 'Identify -> Salvage w/ Kit',
    expectedValue: 18, // silver per piece
    tool: 'Mystic Salvage Kit'
  },
  {
    item: 'Ectoplasm',
    action: 'Salvage for Dust',
    expectedValue: 'Variable',
    tool: 'Copper-Fed Salvage-o-Matic'
  }
];
