# Competitive Landscape Analyzer — Setup Guide

# Setup

```bash
mkdir competitive-analyzer && cd competitive-analyzer && git init
mkdir -p .claude backend frontend

# Place downloaded files:
# 1-CLAUDE.md          → ./CLAUDE.md
# 2-backend-CLAUDE.md  → ./backend/CLAUDE.md
# 3-claude-settings.json → ./.claude/settings.json
# 4-env-example.txt    → ./.env.example

cp .env.example .env
# Add ALL THREE API keys to .env:
#   OPENAI_API_KEY=sk-...
#   ANTHROPIC_API_KEY=sk-ant-...
#   GEMINI_API_KEY=...

claude       # open Claude Code
/init        # let it scan CLAUDE.md
# Paste Prompt 1, then 2, 3, 4, 5, 6 in order
```

---

# The 6 Prompts (paste into Claude Code in order)

## Prompt 1: Scaffold [PLAN MODE]

```
Set up the complete project structure exactly as defined in CLAUDE.md.

Backend (backend/):
- Poetry project. Deps: fastapi, uvicorn[standard], pydantic,
  pydantic-settings, 'openai-agents[litellm]', sse-starlette, httpx
- Dev deps: pytest, pytest-asyncio, ruff, mypy
- IMPORTANT: install openai-agents WITH the [litellm] extra
- Create all directories + __init__.py per CLAUDE.md structure
- app/config.py using pydantic-settings:
  OPENAI_API_KEY: str
  ANTHROPIC_API_KEY: str
  GEMINI_API_KEY: str
  RESEARCH_MODEL: str = "gpt-4o"
  SYNTHESIS_MODEL: str = "anthropic/claude-sonnet-4-5-20250929"
  GUARDRAIL_MODEL: str = "gemini/gemini-2.0-flash"
  model_config = SettingsConfigDict(env_file=".env")
- app/main.py: FastAPI, CORSMiddleware (http://localhost:5173),
  include health router
- app/routers/health.py: GET /health → {"status": "ok"}

Frontend (frontend/):
- pnpm create vite frontend --template react-ts
- Deps: @tanstack/react-query zod
- Dev: tailwindcss @tailwindcss/vite eslint prettier
- tsconfig strict mode, Tailwind with Vite plugin
- App.tsx with QueryClientProvider

Verify both start. Run ruff + mypy + pnpm typecheck.
```

## Prompt 2: Pydantic Models [NORMAL MODE]

```
Create all Pydantic models. Use Field(description="...") on EVERY field —
the SDK uses these for structured output schema generation.

app/models/responses.py:

class Competitor(BaseModel):
    name: str = Field(description="Company name")
    description: str = Field(description="What this company does in the market")
    products: list[str] = Field(description="Key products or services")
    positioning: str = Field(description="Competitive positioning strategy")
    estimated_market_share: float | None = Field(default=None, description="Market share % if available")

class IncumbentsReport(BaseModel):
    market: str = Field(description="Market analyzed")
    competitors: list[Competitor] = Field(description="Established players found")
    analysis_summary: str = Field(description="Overview of competitive landscape")

class FundedStartup(BaseModel):
    name: str = Field(description="Startup name")
    funding_stage: str = Field(description="Seed, Series A, Series B, etc.")
    amount_raised: str | None = Field(default=None, description="e.g. '$15M'")
    focus_area: str = Field(description="Specific niche they target")
    year_founded: int | None = Field(default=None)

class EmergingReport(BaseModel):
    market: str
    startups: list[FundedStartup] = Field(description="Recently funded startups")
    capital_velocity: str = Field(description="How fast capital flows into the space")
    trend_summary: str = Field(description="Key emerging competitor trends")

class MarketSizingReport(BaseModel):
    market: str
    tam: str = Field(description="Total Addressable Market with $ figure and source")
    sam: str = Field(description="Serviceable Addressable Market with $ figure")
    growth_rate: str = Field(description="CAGR with time period, e.g. '12% CAGR 2024-2029'")
    key_drivers: list[str] = Field(description="Factors driving growth")
    sources: list[str] = Field(description="Sources: Gartner, Statista, Forrester, etc.")

class SynthesisReport(BaseModel):
    opportunity_score: int = Field(ge=1, le=10, description="1-10 opportunity rating")
    recommendation: Literal["GO", "NO_GO", "CONDITIONAL"]
    white_space: str = Field(description="Gaps and unmet needs identified")
    risks: list[str] = Field(description="Key risks for entering this market")
    reasoning: str = Field(description="Detailed justification citing specific research data")

class AnalysisResult(BaseModel):
    company: str
    market: str
    incumbents: IncumbentsReport
    emerging: EmergingReport
    market_sizing: MarketSizingReport
    synthesis: SynthesisReport
    created_at: datetime = Field(default_factory=datetime.utcnow)

class InputValidation(BaseModel):
    is_valid: bool
    reason: str = Field(description="Why input is valid or invalid")

app/models/requests.py:
class AnalysisRequest(BaseModel):
    company: str = Field(min_length=1, description="Company to evaluate")
    market: str = Field(min_length=1, description="Market/product space to analyze")

Run ruff + mypy.
```

## Prompt 3: Agents + Pipeline [PLAN MODE]

```
Create all agents and the pipeline. Follow backend/CLAUDE.md EXACTLY.

CRITICAL: Research agents use model="gpt-4o" (plain string — native OpenAI).
Synthesis uses LitellmModel(model=settings.SYNTHESIS_MODEL).
Guardrail uses LitellmModel(model=settings.GUARDRAIL_MODEL).

1. app/agents/guardrails.py
   - Import LitellmModel from agents.extensions.models.litellm_model
   - guardrail_agent: model=LitellmModel(model=settings.GUARDRAIL_MODEL)
   - output_type=InputValidation
   - @input_guardrail function

2. app/agents/incumbents.py
   - model=settings.RESEARCH_MODEL (string "gpt-4o" — native OpenAI)
   - tools=[WebSearchTool()], output_type=IncumbentsReport
   - Instructions: search for "[market] Gartner Magic Quadrant",
     "[market] enterprise leaders". Find 5-8 players. Cite sources.

3. app/agents/emerging.py
   - model=settings.RESEARCH_MODEL, tools=[WebSearchTool()]
   - output_type=EmergingReport
   - Instructions: search for "[market] startup funding 2024 2025",
     "crunchbase [market] series A B". Find Seed-Series B startups.

4. app/agents/market_sizing.py
   - model=settings.RESEARCH_MODEL, tools=[WebSearchTool()]
   - output_type=MarketSizingReport
   - Instructions: search for "[market] TAM SAM market size",
     "[market] Gartner forecast". Cite every number.

5. app/agents/synthesis.py
   - Import LitellmModel
   - model=LitellmModel(model=settings.SYNTHESIS_MODEL) ← Claude Sonnet
   - tools=[] ← NO WebSearchTool
   - output_type=SynthesisReport
   - Instructions: cross-reference all 3 reports, white space, risks,
     score 1-10, GO/NO_GO/CONDITIONAL. MUST cite specific data.

6. app/services/pipeline.py — Python orchestrator
   - async def run_analysis(company, market) → AnalysisResult
     * trace("competitive-analysis")
     * asyncio.gather for 3 research agents IN PARALLEL
     * Format all outputs → synthesis prompt (include company name)
     * Run synthesis (Claude), return AnalysisResult
   - async def run_analysis_streamed(company, market) → AsyncGenerator
     * Sequential + SSE events between each step
     * Include preview data and model name per step

Run ruff + mypy + pytest.
```

## Prompt 4: API Routes + Tests [PLAN MODE]

```
Create FastAPI routes and tests per backend/CLAUDE.md patterns.

app/routers/analysis.py:
1. POST /api/analyze → AnalysisResult (parallel pipeline)
2. POST /api/analyze/stream → EventSourceResponse (sequential + SSE)
- Error handling: InputGuardrailTripwireTriggered → 422, Exception → 500

Wire into main.py.

tests/conftest.py: fixtures for AsyncClient + mock data
tests/test_routers.py: test 200 + 422 cases (mock Runner.run)
tests/test_pipeline.py: verify all 4 agents called, verify result shape

NEVER call real APIs in tests. Mock Runner.run with side_effect.
Run ruff + mypy + pytest. All tests must pass.
```

## Prompt 5: Frontend [PLAN MODE]

```
Build the analysis UI. Judged on DESIGN INSTINCT: "Would a non-technical
stakeholder understand and trust it?"

Design direction: Executive briefing tool. Bloomberg Terminal meets McKinsey.
Palette: slate/zinc base, emerald=GO, rose=NO_GO, amber=CONDITIONAL.

4 states: INPUT → STREAMING → RESULTS → ERROR

Build these files in frontend/src/:

1. lib/schemas.ts — Zod schemas matching all backend models
2. lib/api.ts — typed POST /api/analyze + fetch-based SSE reader for /stream
3. types/analysis.ts — z.infer types from schemas
4. features/analysis/hooks/useAnalysis.ts — TanStack useMutation
5. features/analysis/hooks/useAnalysisStream.ts — SSE hook with step tracking
6. features/analysis/AnalysisForm.tsx — company + market inputs
7. features/analysis/StreamProgress.tsx — vertical stepper with model labels
8. features/analysis/SynthesisPanel.tsx — HERO: Go/No-Go badge + score + reasoning
9. features/analysis/ResearchCard.tsx — reusable for incumbents/emerging/market
10. features/analysis/ResultsView.tsx — Synthesis hero on top, 3 cards below
11. features/analysis/AnalysisPage.tsx — state machine wiring everything
12. App.tsx — QueryClientProvider + AnalysisPage

Run pnpm typecheck && pnpm lint.
```

## Prompt 6: README + Polish [PLAN MODE]

```
Create README.md at project root — this is a DELIVERABLE.

Include:
1. Title + one-line description
2. Quick Start: prerequisites, clone, install, configure 3 API keys, start both
3. Architecture: pipeline diagram, multi-provider table, Python orchestration rationale
4. Design Decisions: why Python orchestration, why multi-provider, why dual endpoints
5. Tech stack table
6. Testing section

Create .gitignore (Python + Node + .env).
Review entire codebase. Run all tests. Fix anything broken.
```

---

# Demo Script — What to Say

"I use three different LLM providers, each chosen for what it does best.

Research agents run on gpt-4o because WebSearchTool is an OpenAI hosted tool —
it requires the Responses API, so there's no provider choice here.

The synthesis agent runs on Claude Sonnet. It doesn't need web search — it's
pure reasoning over structured data. Claude excels at nuanced analysis and
following complex instructions with specific data citations.

The input guardrail runs on Gemini Flash. It's a simple binary check — is this
a real company and market? Using gpt-4o for this would be like using a Ferrari
to go grocery shopping.

The pipeline is orchestrated in Python, not by an LLM agent. asyncio.gather
runs the three research agents in parallel — about 3x faster than sequential.
An LLM orchestrator would add cost and unpredictability for a fixed pipeline.

The streaming endpoint runs sequentially so the frontend shows real-time progress.
That's a deliberate tradeoff: speed vs user feedback."

---

# Evaluation Mapping

| Criterion | What you built | Why it scores |
|---|---|---|
| **Solution Design** | Python pipeline + asyncio.gather + dual endpoints | Deterministic, fast, articulate tradeoffs |
| **Agent Architecture** | 4 agents 1:1 with research spaces, code orchestration | Clean scoping, intelligent data flow |
| **AI Fluency** | 3 providers (OpenAI/Claude/Gemini), WebSearchTool, output_type, guardrails, trace | Right model per task, SDK-native patterns |
| **Design Instinct** | Synthesis hero, streaming progress, scannable cards | VP of Strategy would trust this |
| **Code Quality** | Pydantic + Zod + strict TS, auto-linted hooks, no over-engineering | Typed end-to-end, clean structure |
