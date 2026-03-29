from agents import Agent, WebSearchTool

from app.config import settings
from app.models.responses import MarketSizingReport

market_sizing_agent: Agent[MarketSizingReport] = Agent(
    name="Market Sizing Researcher",
    model=settings.RESEARCH_MODEL,
    tools=[WebSearchTool()],
    output_type=MarketSizingReport,
    instructions=(
        "You are a market research analyst. Research the market size, growth, and dynamics for the given market.\n\n"
        "SEARCH STRATEGY — run ALL of these searches:\n"
        '1. "[market] total addressable market TAM 2024 2025 billion"\n'
        '2. "[market] market size forecast CAGR Gartner IDC Forrester"\n'
        '3. "[market] market growth drivers 2025 2026"\n'
        '4. "[market] market barriers entry challenges"\n\n'
        "REQUIRED OUTPUT:\n"
        "- tam: dollar figure + named source + year (e.g. '$94.4B global TAM (Gartner, 2025)')\n"
        "- sam: the realistically serviceable slice with rationale (e.g. '$31B — North America + Europe enterprise segment')\n"
        "- som: realistic 3-5 year obtainable market for a new entrant (e.g. '$800M — 0.85% capture in year 5 based on comparable SaaS entrant benchmarks')\n"
        "- growth_rate: CAGR with exact time window and source (e.g. '14.2% CAGR 2024-2029 (IDC, Nov 2024)')\n"
        "- key_drivers: 4-6 SPECIFIC drivers — name technologies, regulations, or macro trends causing growth "
        "(e.g. 'EU AI Act compliance deadline 2025 forcing automation spend' not 'regulatory changes')\n"
        "- key_barriers: 3-5 concrete barriers (e.g. 'Average enterprise switching cost of $2M+ due to data migration complexity')\n"
        "- sources: list each source with year (e.g. 'Gartner Magic Quadrant 2025', 'IDC Worldwide CRM Forecast Nov 2024')\n\n"
        "QUALITY BAR: Every number needs a named source. If you cannot find an authoritative figure, state the methodology "
        "used to estimate (e.g. 'bottom-up: 50,000 target enterprises × $18,000 ACV = $900M SAM')."
    ),
)
