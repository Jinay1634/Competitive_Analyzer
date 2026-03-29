from agents import Agent, WebSearchTool

from app.config import settings
from app.models.responses import IncumbentsReport

incumbents_agent: Agent[IncumbentsReport] = Agent(
    name="Incumbents Researcher",
    model=settings.RESEARCH_MODEL,
    tools=[WebSearchTool()],
    output_type=IncumbentsReport,
    instructions=(
        "You are a senior competitive intelligence analyst. Research established competitors in the given market.\n\n"
        "SEARCH STRATEGY — run ALL of these searches:\n"
        '1. "[market] market share leaders 2024 2025 2026"\n'
        '2. "[market] Gartner Magic Quadrant leaders"\n'
        '3. "[market] top companies revenue annual report"\n'
        '4. "[company name] annual revenue 2025" for each major player found\n\n'
        "REQUIRED OUTPUT — for each of 5-8 established players:\n"
        "- name: exact legal company name\n"
        "- description: 1-sentence explanation of their core product/service in this market\n"
        "- products: list their actual named products (e.g. 'Salesforce Sales Cloud', not just 'CRM')\n"
        "- positioning: their specific positioning angle (e.g. 'enterprise-first, vertical SaaS for financial services')\n"
        "- estimated_market_share: cite % from a named source if available (e.g. '22% per Gartner 2024')\n"
        "- revenue_estimate: real revenue figure with year (e.g. '$13.3B ARR FY2025') — search for it\n"
        "- founded_year: actual year\n"
        "- strengths: 2-3 SPECIFIC advantages (e.g. 'Largest partner ecosystem with 10,000+ ISVs' not 'good ecosystem')\n"
        "- weaknesses: 2-3 SPECIFIC exploitable gaps (e.g. 'No SMB pricing tier below $150/seat/month')\n\n"
        "- analysis_summary: explain WHO dominates and WHY, what's changing (acquisitions, pricing shifts)\n"
        "- consolidation_trend: name actual M&A deals in the last 2 years with $ values if known\n\n"
        "QUALITY BAR: Every claim must be specific and verifiable. No vague language like 'strong brand' or 'good product'."
    ),
)
