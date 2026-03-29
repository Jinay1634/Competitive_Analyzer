from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class Competitor(BaseModel):
    name: str = Field(description="Company name")
    description: str = Field(description="What this company does in the market")
    products: list[str] = Field(description="Key products or services")
    positioning: str = Field(description="Competitive positioning strategy")
    estimated_market_share: float | None = Field(default=None, description="Market share % if available")
    revenue_estimate: str | None = Field(default=None, description="Revenue estimate with year, e.g. '$2.4B ARR (2024)'")
    founded_year: int | None = Field(default=None, description="Year company was founded")
    strengths: list[str] = Field(default_factory=list, description="Top 2-3 specific competitive strengths")
    weaknesses: list[str] = Field(default_factory=list, description="Top 2-3 exploitable weaknesses or blind spots")


class IncumbentsReport(BaseModel):
    market: str = Field(description="Market analyzed")
    competitors: list[Competitor] = Field(description="Established players found")
    analysis_summary: str = Field(description="Overview of competitive landscape with key dynamics")
    consolidation_trend: str = Field(description="M&A and market consolidation trends, e.g. 'High — 3 major acquisitions in 2024'")


class FundedStartup(BaseModel):
    name: str = Field(description="Startup name")
    funding_stage: str = Field(description="Seed, Series A, Series B, etc.")
    amount_raised: str | None = Field(default=None, description="Total raised, e.g. '$47M'")
    focus_area: str = Field(description="Specific niche they target within the broader market")
    year_founded: int | None = Field(default=None, description="Year the startup was founded")
    investors: list[str] = Field(default_factory=list, description="Named lead investors, e.g. ['a16z', 'Sequoia']")
    key_differentiator: str = Field(description="What makes them different from incumbents — specific technical or business model angle")


class EmergingReport(BaseModel):
    market: str = Field(description="Market analyzed")
    startups: list[FundedStartup] = Field(description="Recently funded startups")
    capital_velocity: str = Field(description="How fast capital flows into the space, e.g. 'Very High — $2.1B deployed in 2024'")
    trend_summary: str = Field(description="Key emerging patterns: what angles VCs are betting on")
    disruption_risk: str = Field(description="Assessment of how much disruption risk startups pose to incumbents, with rationale")


class MarketSizingReport(BaseModel):
    market: str = Field(description="Market analyzed")
    tam: str = Field(description="Total Addressable Market with $ figure, source, and year, e.g. '$94B (Gartner, 2025)'")
    sam: str = Field(description="Serviceable Addressable Market with $ figure and rationale")
    som: str = Field(description="Serviceable Obtainable Market — realistic 3-5 year capture estimate with reasoning")
    growth_rate: str = Field(description="CAGR with time period and source, e.g. '14.2% CAGR 2024-2029 (IDC)'")
    key_drivers: list[str] = Field(description="Specific factors driving growth — name technologies, regulations, or trends")
    key_barriers: list[str] = Field(description="Barriers to entry: switching costs, regulation, capital requirements, etc.")
    sources: list[str] = Field(description="Named sources with years: 'Gartner 2025', 'IDC Q3 2024', etc.")


class SynthesisReport(BaseModel):
    opportunity_score: int = Field(ge=1, le=10, description="1-10 opportunity rating")
    recommendation: Literal["GO", "NO_GO", "CONDITIONAL"] = Field(
        description="GO, NO_GO, or CONDITIONAL market entry recommendation"
    )
    white_space: str = Field(description="Specific gaps and unmet needs identified — name the segment and why incumbents miss it")
    risks: list[str] = Field(description="Specific risks with context, e.g. 'Salesforce has 19% market share and $4B R&D budget'")
    conditions: list[str] = Field(default_factory=list, description="If CONDITIONAL: concrete must-do conditions before entering")
    entry_strategy: str = Field(description="Recommended go-to-market angle: which segment to target first and why")
    reasoning: str = Field(description="Detailed justification citing specific data: company names, $ figures, growth rates from research")


class AnalysisResult(BaseModel):
    company: str = Field(description="Company being evaluated")
    market: str = Field(description="Market or product space analyzed")
    incumbents: IncumbentsReport = Field(description="Established competitor research")
    emerging: EmergingReport = Field(description="Emerging startup research")
    market_sizing: MarketSizingReport = Field(description="Market size and growth research")
    synthesis: SynthesisReport = Field(description="Go/No-Go synthesis and recommendation")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Timestamp of analysis")


class InputValidation(BaseModel):
    is_valid: bool = Field(description="Whether the input contains a real company and market")
    reason: str = Field(description="Why input is valid or invalid")
