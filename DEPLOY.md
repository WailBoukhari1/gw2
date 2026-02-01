# Deployment Guide for Vercel

This application is ready to be deployed to Vercel. Follow these steps to deploy "without installation" (using the web dashboard).

## 1. Prepare for Deployment

Ensure you have the latest code committed to GitHub:
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

## 2. Deploy on Vercel

1.  Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** -> **"Project"**.
2.  Import your GitHub repository (`gw2-flip-dashboard`).
3.  **Framework Preset**: Select **Vite** (it should auto-detect).
4.  **Root Directory**: `./` (default).
5.  **Build Command**: `npm run build` (default).
6.  **Output Directory**: `dist` (default).

## 3. Configure Environment Variables (Crucial!)

To "store the API" securely without putting it in code, add these **Environment Variables** in the deployment screen (or later in Settings -> Environment Variables):

| Key | Value | Description |
| --- | --- | --- |
| `VITE_GEMINI_API_KEY` | `AIzaSy...` | Your Google Gemini API Key |
| `VITE_GW2_API_KEY` | `9552A3...` | Your Guild Wars 2 API Key |

*Note: You can use the same keys you used locally.*

## 4. Data Retention ("Learning Stuff")

This application uses a sophisticated **Browser Database (IndexedDB)** to store:
*   Market Data & History
*   **AI Analysis Results** ("Learning Stuff")
*   User Settings

**How it works on Vercel:**
*   Data is stored **locally in your browser** visiting the Vercel URL.
*   It **persists** even after you close the tab or refresh.
*   It does **not** sync between different computers automatically (for security/complexity reasons without a backend).
*   **Optimization**: AI results are cached for 24 hours to prevent hitting "Rate Limit Exceeded" errors and save your API quota.

## 5. Click "Deploy"

Once deployed, you will get a URL like `https://gw2-flip-dashboard.vercel.app`. Your app is now live, optimized, and persistent!
