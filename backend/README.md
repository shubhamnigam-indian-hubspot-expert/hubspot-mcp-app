# Find Record Backend

Backend service for the HubSpot **Find Record** workflow action and agent tool. Handles record lookup and dynamic dropdown options.

## Setup

1. **Copy environment variables:**
   ```bash
   cp .env.example .env
   ```

2. **Configure `.env`:**
   - `HUBSPOT_ACCESS_TOKEN` (required) – Private app access token from HubSpot
   - `HUBSPOT_CLIENT_SECRET` (optional) – App client secret for request validation

3. **Deploy to Vercel:**
   ```bash
   cd backend
   vercel
   ```

   Or connect the `backend` folder to Vercel via the dashboard.

4. **Update workflow action URL:**
   In `Search Agent - MCP SN Project/src/app/workflow-actions/find-record-hsmeta.json`, replace:
   - `https://your-backend.vercel.app` with your deployed URL (e.g. `https://find-record-xxx.vercel.app`)

## Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/find-record` | Execute find record (workflow/agent action) |
| `POST /api/options` | Dynamic options for object type and search property dropdowns |

## Local Development

```bash
cd backend
npx vercel dev
```

This runs the serverless functions locally. Use a tunnel (e.g. ngrok) to test with HubSpot.

## HubSpot Configuration

1. Create a [Private App](https://developers.hubspot.com/docs/api/private-apps) in your HubSpot account.
2. Add scopes: `crm.objects.contacts.read`, `crm.objects.companies.read`, `crm.objects.deals.read`, `crm.objects.tickets.read`, `crm.objects.leads.read`, `crm.schemas.custom.read`.
3. Copy the access token to `HUBSPOT_ACCESS_TOKEN`.
4. For signature validation, get the client secret from your app’s Auth tab and set `HUBSPOT_CLIENT_SECRET`.
