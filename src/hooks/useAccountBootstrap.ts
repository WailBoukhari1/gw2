import { useEffect, useCallback } from 'react';
import { useAccountStore } from '../store/useAccountStore';
import { api } from '../services/api.service';



export const useAccountBootstrap = () => {
  const { 
    apiKey, 
    isValid, 
    setIsValid, 
    setAccountData, 
    setWallet,
    setPermissions 
  } = useAccountStore();

  const sync = useCallback(async (key: string) => {
    if (!key) return;
    try {
      // 1. Basic Account Info (Check Validity)
      const acc = await api.getAccountInfo(key);
      setAccountData(acc);
      
      // 2. Permissions (Critical for features)
      // 2. Permissions (From TokenInfo)
      try {
        const tokenInfo = await api.getTokenInfo(key);
        if (tokenInfo.permissions) {
             setPermissions(tokenInfo.permissions);
        }
      } catch (e) {
        console.warn('Failed to fetch token permissions', e);
      }

      setIsValid(true);
      
      const walletData = await api.getWallet(key);
      setWallet(walletData);
    } catch (err) {
      console.error('Background Auth Sync Failed:', err);
      // We don't necessarily set isValid to false here to avoid flickering on transient network errors,
      // but if it's a 401/403, we should.
      if ((err as any).response?.status === 401 || (err as any).response?.status === 403) {
        setIsValid(false);
      }
    }
  }, [setAccountData, setIsValid, setWallet, setPermissions]);

  // Hydration logic is now handled by Zustand persist.
  // We no longer sync from user-config.js.
  
  useEffect(() => {
    // Optional: Log status or other bootstrap tasks
    if (apiKey) {
      console.log('Account Bootstrap: Key found, syncing...');
    }
  }, [apiKey]);

  useEffect(() => {
    if (apiKey) {
      sync(apiKey);
    }
  }, [apiKey, sync]);

  // Global background refresh every 60s
  useEffect(() => {
    if (!apiKey || !isValid) return;
    const interval = setInterval(() => {
        sync(apiKey);
        useAccountStore.getState().syncTradingPost();
    }, 60000);
    return () => clearInterval(interval);
  }, [apiKey, isValid, sync]);

  return { sync };
};
