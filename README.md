# Agilist Website

Modern AI consulting site with a Vite React frontend (`client/`) and an Express API (`server/`). The repo includes a `render.yaml` blueprint for deploying both services on Render.

## Project Structure

```
client/   Vite + React single-page app
server/   Express API (OpenAI integration, RAG, realtime voice)
render.yaml  Render blueprint defining static site + web service
```

## Local Development

```bash
# Frontend (client)
cd client
npm install
npm run dev

# Backend (server)
cd server
npm install
npm run dev
```

Backend expects a `.env` file with:

```
OPENAI_API_KEY=...
OPENAI_VECTOR_STORE_ID=...
OPENAI_TEXT_MODEL=gpt-5-nano
OPENAI_REALTIME_MODEL=gpt-4o-realtime-preview-2024-12-17
OPENAI_REALTIME_VOICES=alloy,breeze,coral,marin,sage,verse
OPENAI_AGENT_INSTRUCTIONS="..."
PORT=4000
```

Frontend expects `VITE_API_BASE_URL` (defaults to `http://localhost:4000`).

## Deployment on Render

1. Push this repo to GitHub (see Git section below).
2. In Render, click **New Blueprint** and select this repo. Render will detect `render.yaml` and propose two services:
   - **ai-consulting-site** (Static Site)
     - Root: `client/`
     - Build: `npm install && npm run build`
     - Publish dir: `dist`
     - Set env var `VITE_API_BASE_URL` to the API URL (e.g., `https://api.agilist.co.uk`).
   - **ai-consulting-api** (Web Service)
     - Root: `server/`
     - Build: `npm install`
     - Start: `npm run start`
     - Health check: `/health`
     - Add env vars: `OPENAI_API_KEY`, `OPENAI_VECTOR_STORE_ID`, `OPENAI_TEXT_MODEL`, `OPENAI_REALTIME_MODEL`, `OPENAI_REALTIME_VOICES`, `OPENAI_AGENT_INSTRUCTIONS`, `PORT=4000`.
3. Deploy the API first, note its public URL, then update the Static Site env var `VITE_API_BASE_URL` and redeploy the site.
4. Attach custom domains (e.g., `www.agilist.co.uk` for frontend, `api.agilist.co.uk` for backend) via Render Settings. Update DNS with the provided CNAMEs.
5. Optionally tighten CORS in the Express app to allow only the production origins.

## GitHub Workflow

```bash
git init
git add .
git commit -m "feat: initial site + api + render blueprint"

# Replace with your GitHub username or SSH URL
git remote add origin git@github.com:AgilistTim/Agilist_website.git
git branch -M main
git push -u origin main
```

After pushing, connect Render to the repository and trigger the first deploy.

## Notes

- Re-run `server/scripts/ingest.js` whenever you add new Markdown/knowledge-base docs so the vector store stays in sync.
- Use Render preview deploys (enable PR previews) to validate changes before promoting to production.
- Voice chat relies on WebRTC and the OpenAI Realtime API; ensure the backend service stays on a plan with sufficient uptime to avoid cold-start latency.
