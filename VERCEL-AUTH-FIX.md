# Fix: Vercel "Authentication Required" Error

HubSpot cannot access your API because **Vercel Deployment Protection** is enabled. Disable it so the Find Record action can call your backend.

## Steps to Disable Deployment Protection

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Open your project: **search-agent-backend** (or the project you deployed)
3. Click **Settings** in the top navigation
4. In the left sidebar, click **Deployment Protection**
5. Set **Protection Level** to **None** (or "Vercel Authentication" → change to None)
6. Save if prompted

## Alternative: Use Production URL

If you have a production deployment, try using the production URL instead of the preview URL:

- **Preview URL** (protected): `search-agent-backend-lq1ubbxzo-shubhamnsrmu-3609s-projects.vercel.app`
- **Production URL** (often public): `search-agent-backend.vercel.app` or `search-agent-backend-shubhamnsrmu-3609s-projects.vercel.app`

Check your Vercel project's **Domains** tab for the production URL, then update the workflow action's `actionUrl` to use it.
