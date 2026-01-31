import type { GW2Item, GW2Price } from '../types';

const API_BASE = 'https://api.guildwars2.com/v2';

// Cache to prevent hitting rate limits
const itemCache = new Map<number, GW2Item>();
const priceCache = new Map<number, { data: GW2Price; timestamp: number }>();

const CACHE_TTL = 30000; // 30 seconds

import { apiRateLimiter } from '../utils/rate-limiter';

// Robust request helper with retries & rate limiting
const request = async (url: string, options: any = {}, retries = 2): Promise<any> => {
  return apiRateLimiter.add(async () => {
    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: options.headers,
        body: options.body,
        // Native fetch timeout handling
        signal: AbortSignal.timeout(options.timeout || 30000)
      });
      
      if (!response.ok) {
        const error: any = new Error(`HTTP Error: ${response.status}`);
        error.response = { status: response.status };
        throw error;
      }
      
      const data = await response.json();
      return { data };
    } catch (err: any) {
      if (retries > 0 && (!err.response || err.response.status >= 500)) {
        await new Promise(r => setTimeout(r, 1000));
        return request(url, options, retries - 1); 
      }
      throw err;
    }
  });
};

/**
 * Smart Auth: Some networks/VPNs block custom Authorization headers.
 * Query parameters are most compatible and avoid CORS preflight (Simple Request).
 */
const smartRequest = async (url: string, apiKey: string, options: any = {}) => {
  const separator = url.includes('?') ? '&' : '?';
  const urlWithKey = `${url}${separator}access_token=${apiKey}`;
  
  try {
    return await request(urlWithKey, options);
  } catch (err: any) {
    if (err.response?.status === 401) {
       console.error("GW2 API Key unauthorized.");
    }
    throw err;
  }
};

export const api = {
  // Check if we can reach the API at all (Public endpoint)
  async ping(): Promise<boolean> {
    try {
      // Try axios first
      const resp = await request(`${API_BASE}/quaggans`, { timeout: 10000 });
      if (resp.status === 200) return true;
      
      // Fallback to native fetch to bypass any axios-specific interceptors/config
      const fetchResp = await fetch(`${API_BASE}/quaggans`);
      return fetchResp.ok;
    } catch (e) {
      return false;
    }
  },
  // Fetch item details (with caching)
  async getItem(id: number): Promise<GW2Item> {
    if (itemCache.has(id)) return itemCache.get(id)!;
    
    try {
      const response = await request(`${API_BASE}/items/${id}`);
      itemCache.set(id, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching item ${id}`, error);
      throw error;
    }
  },

  // Fetch multiple items
  async getItems(ids: number[]): Promise<GW2Item[]> {
    // Filter out cached items
    const uncachedIds = ids.filter(id => !itemCache.has(id));
    
    if (uncachedIds.length > 0) {
      // Small chunk size (100) to avoid URL length issues and isolate bad IDs
      const CHUNK_SIZE = 100;
      const chunks = [];
      for (let i = 0; i < uncachedIds.length; i += CHUNK_SIZE) {
        chunks.push(uncachedIds.slice(i, i + CHUNK_SIZE));
      }

      for (const chunk of chunks) {
        try {
          const response = await request(`${API_BASE}/items?ids=${chunk.join(',')}`);
          if (response.data && Array.isArray(response.data)) {
            response.data.forEach((item: GW2Item) => itemCache.set(item.id, item));
          }
        } catch (error: any) {
          // If a chunk fails with 404, it might contain a "bad" ID. 
          // Log it and continue to next chunk.
          if (error.response?.status === 404) {
             console.warn(`Items chunk failed (404), likely an invalid ID in chunk of ${chunk.length}`);
          } else {
             console.error('Error fetching items chunk', error);
          }
        }
      }
    }

    return ids.map(id => itemCache.get(id)!).filter(Boolean);
  },

  async getPrices(ids: number[]): Promise<GW2Price[]> {
    if (ids.length === 0) return [];
    const now = Date.now();
    const validIds = ids.filter(id => {
      const cached = priceCache.get(id);
      return !cached || (now - cached.timestamp > CACHE_TTL);
    });

    if (validIds.length > 0) {
      const chunks = [];
      const CHUNK_SIZE = 50; // Reduced from 200 to avoid ERR_INSUFFICIENT_RESOURCES
      for (let i = 0; i < validIds.length; i += CHUNK_SIZE) {
        chunks.push(validIds.slice(i, i + CHUNK_SIZE));
      }

      for (const chunk of chunks) {
        try {
          const response = await request(`${API_BASE}/commerce/prices?ids=${chunk.join(',')}`);
          if (response.data && Array.isArray(response.data)) {
            response.data.forEach((price: GW2Price) => {
              priceCache.set(price.id, { data: price, timestamp: now });
            });
          }
        } catch (error: any) {
          // If 404, some items in this chunk aren't tradable. We should ignore the 404.
          if (error.response?.status !== 404) {
            console.error('Error fetching prices', error);
          }
        }
      }
    }

    return ids.map(id => priceCache.get(id)?.data).filter(Boolean) as GW2Price[];
  },

  // Popular items for initial load
  // Strategy: We will bootstrap with a list of "Popular Items" IDs for now.

  async getAccountInfo(apiKey: string, options: any = {}): Promise<any> {
    const response = await smartRequest(`${API_BASE}/account`, apiKey, options);
    return response.data;
  },

  async getTokenInfo(apiKey: string): Promise<any> {
    const response = await smartRequest(`${API_BASE}/tokeninfo`, apiKey);
    return response.data;
  },

  async getWallet(apiKey: string, options: any = {}): Promise<any[]> {
    const response = await smartRequest(`${API_BASE}/account/wallet`, apiKey, options);
    return response.data;
  },

  async getInventory(apiKey: string, options: any = {}): Promise<any[]> {
    const response = await smartRequest(`${API_BASE}/account/inventory`, apiKey, options);
    return response.data; // Keep raw for processing
  },

  async getCharacters(apiKey: string): Promise<string[]> {
    const response = await smartRequest(`${API_BASE}/characters`, apiKey);
    return response.data;
  },

  async getCharacterInventory(apiKey: string, name: string): Promise<any[]> {
    const response = await smartRequest(`${API_BASE}/characters/${encodeURIComponent(name)}/inventory`, apiKey);
    return response.data;
  },

  async getBank(apiKey: string): Promise<any[]> {
    const response = await smartRequest(`${API_BASE}/account/bank`, apiKey);
    return response.data;
  },

  async getSharedInventory(apiKey: string): Promise<any[]> {
    const response = await smartRequest(`${API_BASE}/account/inventory`, apiKey);
    return response.data;
  },

  async getMaterials(apiKey: string): Promise<any[]> {
    const response = await smartRequest(`${API_BASE}/account/materials`, apiKey);
    return response.data;
  },

  // Market Scout: Fetch a broader range of high-volume categories
  async getMarketScoutItems(): Promise<number[]> {
    try {
      // Fetch ALL items that have active buy/sell listings
      const response = await request(`${API_BASE}/commerce/prices`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch full market list, using fallback", error);
      // Categories: T6 Mats, Ectos, Rare Runes/Sigils, Mid-tier Mats
      const baseIds = [...POPULAR_ITEM_IDS];
      const T6_MAT_IDS = [24295, 24289, 24283, 24277, 24351, 24357, 24294, 24291];
      const CURRENCY_LIKE = [19976, 19721, 19739, 19740];
      const HIGH_VOLUME_RARES = [24329, 24330, 72339, 74326];
      
      return [...new Set([...baseIds, ...T6_MAT_IDS, ...CURRENCY_LIKE, ...HIGH_VOLUME_RARES])];
    }
  },

  // Fetch full market depth (listings)
  async getListings(id: number): Promise<any> {
    try {
      const response = await request(`${API_BASE}/commerce/listings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching listings for ${id}`, error);
      return null;
    }
  },

  // Fetch trade history (Returns 404 if no history exists - this is normal and handled)
  async getTransactionHistory(apiKey: string, type: 'buys' | 'sells', state: 'current' | 'history'): Promise<any[]> {
    try {
      // Correct endpoint: /v2/commerce/transactions/... (NO /account)
      const response = await smartRequest(`${API_BASE}/commerce/transactions/${state}/${type}`, apiKey);
      
      // Validate array response to prevent flatMap errors upstream
      if (!Array.isArray(response.data)) {
        console.warn(`TP History expected array but got:`, response.data);
        return [];
      }
      
      return response.data;
    } catch (error: any) {
      // GW2 API returns 404 if the user has NO history in that category
      if (error.response?.status === 404) {
        return [];
      }
      console.error(`Error fetching trade history (${state}/${type})`, error);
      return [];
    }
  },

  async getDelivery(apiKey: string): Promise<any> {
    try {
      const response = await smartRequest(`${API_BASE}/commerce/delivery`, apiKey);
      return response.data;
    } catch (error) {
      console.error(`Error fetching delivery data`, error);
      return { coins: 0, items: [] };
    }
  }
};

// Popular items for initial load
export const POPULAR_ITEM_IDS = [
  19721, // Glob of Ectoplasm
  19976, // Mystic Coin
  24277, // The Bifrost (Legendary)
  30689, // Eternity
  19684, // Mithril Ore
  19722, // Elder Wood Log
  24358, // Ancient Wood Log
  46738, // Deldrimor Steel Ingot
  46739, // Elonian Leather Square
  46741, // Bolt of Damask
  46740, // Spiritwood Plank
  24295, // Vial of Powerful Blood (T6)
  24289, // Powerful Venom Sac (T6)
  24283, // Powerful Totem (T6)
  24277, // Pile of Crystalline Dust (T6)
  12134, // Carrots (just for fun)
  12238, // Lettuce
  24329, // Superb Vigor Rune
  72339, // Suntouched Scythe
  89103, // Antique Summoning Stone
  95995, // Chunk of Ancient Ambergris
  96347, // Jade Runestone
];
