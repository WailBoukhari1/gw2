export const config = {
  gemini: {
    // PASTE YOUR API KEY HERE IF YOU WANT TO HARDCODE IT
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || '', 
    // Example: apiKey: 'AIzaSy...',
  },
  gw2: {
    apiKey: import.meta.env.VITE_GW2_API_KEY || '',
  }
};
