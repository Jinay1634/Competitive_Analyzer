# Competitive Intelligence Analyzer

AI-powered competitive research tool. Enter a company and market — get a full report covering incumbent players, emerging startups, market sizing (TAM/SAM/SOM), and a Go/No-Go recommendation.

## How It Works

1. You enter a company name and market/product space
2. Three GPT-4o agents research incumbents, emerging startups, and market sizing in parallel using live web search
3. Claude Sonnet synthesizes all findings into a Go/No-Go verdict with an opportunity score
4. Results are displayed in a dashboard and can be exported as a PDF

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS, Vite |
| Backend | FastAPI, Python 3.12 |
| AI Agents | OpenAI Agents SDK |
| Research | GPT-4o + WebSearchTool |
| Synthesis | Claude Sonnet  |
| Guardrail | Gemini Flash |

## Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- API keys for OpenAI, Anthropic, and Google Gemini

## Running with Docker (Recommended)

**1. Clone the repository**

```bash
git clone <your-repo-url>
cd competitive-analyzer
```

**2. Set up environment variables**

```bash
cp .env.example .env
```

Open `.env` and fill in your API keys:

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
```

**3. Build and start**

```bash
docker compose up --build
```

**4. Open the app**

Visit [http://localhost](http://localhost)

To stop:

```bash
docker compose down
```

---

## Running Locally (Without Docker)

### Backend

Requires Python 3.12 and [Poetry](https://python-poetry.org/docs/#installation).

```bash
cd backend
poetry install
poetry run uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`.

### Frontend

Requires [Node.js](https://nodejs.org) and [pnpm](https://pnpm.io/installation).

```bash
cd frontend
pnpm install
pnpm dev
```

Frontend runs at `http://localhost:5173`.

---

## API Keys

| Key | Where to get it |
|---|---|
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com/api-keys) |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com/app/apikey) |

All three keys are required. If Gemini quota is exhausted, you can disable the input guardrail:

```env
GUARDRAIL_ENABLED=false
```

## Exporting Results

Once an analysis is complete, click **Export PDF** in the top-right corner to download a formatted report.
