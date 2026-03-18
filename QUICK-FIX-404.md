# Fix 404: "The page could not be found"

## Root cause

The workflow action's `actionUrl` points to `https://your-backend.vercel.app` — a placeholder that does not exist. HubSpot gets 404 when it tries to call your backend.

## Fix: Deploy backend and update URL

### Option 1: Vercel via GitHub (no npm/Vercel CLI)

1. Push the `backend` folder to a GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new) → Import your repo.
3. Set **Root Directory** to `backend`.
4. Add env var: `HUBSPOT_ACCESS_TOKEN` = your HubSpot Private App token.
5. Deploy. Copy the URL (e.g. `https://find-record-xxx.vercel.app`).
6. Update `Search Agent - MCP SN Project/src/app/workflow-actions/find-record-hsmeta.json`:
   - Replace `https://your-backend.vercel.app` with your URL.
7. Run: `cd "Search Agent - MCP SN Project" && hs project upload`
8. Run the workflow again.

### Option 2: Vercel CLI (after fixing npm)

```bash
sudo chown -R $(whoami) ~/.npm   # Fix cache permissions
npm cache clean --force
cd backend
npx vercel login
npx vercel --yes
# Add HUBSPOT_ACCESS_TOKEN in Vercel dashboard, then update actionUrl and re-upload
```

### Option 3: Local debugging (to verify backend works)

```bash
cd backend
export HUBSPOT_ACCESS_TOKEN="your-token"
node local-server.js
# In another terminal: npx ngrok http 3000
# Set actionUrl to https://YOUR-NGROK-URL.ngrok-free.app/api/find-record
# Re-upload, run workflow, check .cursor/debug-6de2e5.log
```
