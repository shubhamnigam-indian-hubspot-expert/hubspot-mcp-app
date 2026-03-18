# Search Agent - MCP SN Project

A standalone HubSpot app that provides a **Find Record** workflow action and agent tool. Find any HubSpot CRM record by its unique identifier (contacts, companies, deals, tickets, leads, custom objects).

## Project Structure

```
Search Agent - MCP SN Project/
├── hsproject.json
├── src/
│   └── app/
│       ├── app-hsmeta.json
│       └── workflow-actions/
│           └── find-record-hsmeta.json
└── README.md

../backend/          # Backend (sibling folder - deploy separately)
```

## Setup

### 1. Deploy the backend

```bash
cd backend
cp .env.example .env
# Edit .env with HUBSPOT_ACCESS_TOKEN and optionally HUBSPOT_CLIENT_SECRET
vercel
```

Note the deployed URL (e.g. `https://your-project.vercel.app`).

### 2. Update the workflow action URL

In `src/app/workflow-actions/find-record-hsmeta.json`, replace `https://your-backend.vercel.app` with your deployed backend URL in:

- `actionUrl`
- `optionsUrl` (in both objectType and searchProperty input fields)

### 3. Initialize and upload

```bash
cd "Search Agent - MCP SN Project"
hs init          # If first time - configure HubSpot account
hs project upload
```

### 4. Test

**Workflows:** Create a workflow → Add action → Find your app → **Find Record**

**Agents:** Add the tool to an agent via the [Developer Tool Testing Agent](https://ecosystem.hubspot.com/marketplace/listing/developer-tool-tester-agent)

## Usage

1. **Object type** – Select the record type (Contact, Company, Deal, Ticket, Lead, or custom objects)
2. **Search by property** – Choose the unique identifier (Record ID, Email, Domain, or custom unique properties)
3. **Search value** – Enter the value or use a workflow property token

## Output

- `found` – "true" or "false"
- `recordId` – The HubSpot record ID
- `recordProperties` – JSON string of the record's properties
