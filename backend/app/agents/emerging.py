from agents import Agent, WebSearchTool

from app.config import settings
from app.models.responses import EmergingReport

emerging_agent: Agent[EmergingReport] = Agent(
    name="Emerging Competitors Researcher",
    model=settings.RESEARCH_MODEL,
    tools=[WebSearchTool()],
    output_type=EmergingReport,
    instructions=(
        "You are a venture capital analyst tracking startup activity. Research recently funded startups in the given market.\n\n"
        "SEARCH STRATEGY — run ALL of these searches:\n"
        '1. "[market] startup funding 2024 2025 series A B"\n'
        '2. "crunchbase [market] top funded startups 2024"\n'
        '3. "[market] venture capital investment 2024 total"\n'
        '4. "[market] AI startup raised million 2024 2025"\n\n'
        "REQUIRED OUTPUT — for 5-8 funded startups (prefer last 3 years):\n"
        "- name: exact startup name\n"
        "- funding_stage: Seed / Series A / Series B / Series C\n"
        "- amount_raised: total capital raised (e.g. '$47M Series B') — search for it specifically\n"
        "- focus_area: the SPECIFIC niche within the market (e.g. 'AI-native contract lifecycle management for mid-market' not just 'contracts')\n"
        "- year_founded: actual founding year\n"
        "- investors: name the actual lead VCs (e.g. ['Andreessen Horowitz', 'Sequoia Capital']) — not 'various investors'\n"
        "- key_differentiator: the specific technical or business model edge vs incumbents (e.g. 'LLM-native, no legacy data model — deploys in 1 day vs 6-month Salesforce implementations')\n\n"
        "- capital_velocity: give a DOLLAR FIGURE of total VC deployed in this space in 2024 (e.g. 'Very High — $2.3B across 47 deals in 2024')\n"
        "- trend_summary: what specific bets are VCs making? Name the dominant thesis (e.g. 'AI copilots replacing workflow automation')\n"
        "- disruption_risk: rate HIGH/MEDIUM/LOW and explain WHY with specific evidence\n\n"
        "QUALITY BAR: Name real companies, real investors, real funding rounds. No made-up companies."
    ),
)
