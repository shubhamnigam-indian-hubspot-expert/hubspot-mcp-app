# Deploy Find Record Backend - Fix 404 Error

The 404 error happens because `actionUrl` points to a placeholder that doesn't exist. You need to deploy the backend and update the URL.

## Step 1: Deploy Backend to Vercel

```bash
cd backend

# Login to Vercel (opens browser)
npx vercel login

# Deploy
npx vercel --yes
```

After deployment, Vercel will show your URL, e.g.:
```
https://find-record-backend-xxx.vercel.app
```

## Step 2: Add Environment Variables in Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Open your project → **Settings** → **Environment Variables**
3. Add:
   - `HUBSPOT_ACCESS_TOKEN` = Your HubSpot Private App access token
   - `HUBSPOT_CLIENT_SECRET` (optional) = App client secret for request validation

4. **Redeploy** after adding variables (Deployments → ⋮ → Redeploy)

## Step 3: Create HubSpot Private App (if needed)

1. HubSpot → **Settings** → **Integrations** → **Private Apps**
2. Create app or use existing
3. Scopes: `crm.objects.contacts.read`, `crm.objects.companies.read`, `crm.objects.deals.read`, `crm.objects.leads.read`, `tickets`, `crm.schemas.custom.read`
4. Copy the **Access token**

## Step 4: Update Workflow Action URL

Replace `YOUR_VERCEL_URL` with your actual URL (e.g. `https://find-record-backend-xxx.vercel.app`) in:

**File:** `Search Agent - MCP SN Project/src/app/workflow-actions/find-record-hsmeta.json`

Change:
```json
"actionUrl": "https://your-backend.vercel.app/api/find-record"
```
To:
```json
"actionUrl": "https://YOUR_VERCEL_URL/api/find-record"
```

## Step 5: Re-upload to HubSpot

```bash
cd "Search Agent - MCP SN Project"
hs project upload
```

## Step 6: Test Again

Run your workflow with Contact + Email + shubham.n.srmu@gmail.com. The 404 should be resolved.
