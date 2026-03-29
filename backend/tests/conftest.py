from collections.abc import AsyncGenerator
from datetime import datetime
from unittest.mock import MagicMock

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.models.responses import (
    AnalysisResult,
    Competitor,
    EmergingReport,
    FundedStartup,
    IncumbentsReport,
    InputValidation,
    MarketSizingReport,
    SynthesisReport,
)


def make_run_result(payload: object) -> MagicMock:
    """Wrap a Pydantic model in a mock RunResult with .final_output."""
    mock = MagicMock()
    mock.final_output = payload
    return mock


@pytest.fixture
def mock_incumbents() -> IncumbentsReport:
    return IncumbentsReport(
        market="CRM software",
        competitors=[
            Competitor(
                name="Salesforce",
                description="Enterprise CRM leader",
                products=["Sales Cloud", "Service Cloud"],
                positioning="Market leader",
                estimated_market_share=23.8,
            )
        ],
        analysis_summary="Salesforce dominates with ~24% share. Source: Gartner 2024.",
    )


@pytest.fixture
def mock_emerging() -> EmergingReport:
    return EmergingReport(
        market="CRM software",
        startups=[
            FundedStartup(
                name="Acme CRM",
                funding_stage="Series A",
                amount_raised="$12M",
                focus_area="SMB vertical CRM",
                year_founded=2022,
            )
        ],
        capital_velocity="High — $2B+ invested in CRM startups in 2024",
        trend_summary="AI-native CRM players attracting Series A/B rounds.",
    )


@pytest.fixture
def mock_market_sizing() -> MarketSizingReport:
    return MarketSizingReport(
        market="CRM software",
        tam="$96B by 2028 (Statista 2024)",
        sam="$35B for mid-market segment",
        growth_rate="12% CAGR 2024-2028",
        key_drivers=["AI automation", "remote sales force growth"],
        sources=["Statista 2024", "Gartner 2024"],
    )


@pytest.fixture
def mock_synthesis() -> SynthesisReport:
    return SynthesisReport(
        opportunity_score=7,
        recommendation="CONDITIONAL",
        white_space="No dominant AI-native CRM for SMBs under $50K ARR",
        risks=["Salesforce dominance", "Long sales cycles"],
        reasoning=(
            "The CRM market is large ($96B TAM) with 12% CAGR. "
            "Salesforce holds 23.8% share but is weak in the SMB AI-native segment. "
            "Entry is conditional on differentiating with AI features targeting SMBs."
        ),
    )


@pytest.fixture
def mock_analysis_result(
    mock_incumbents: IncumbentsReport,
    mock_emerging: EmergingReport,
    mock_market_sizing: MarketSizingReport,
    mock_synthesis: SynthesisReport,
) -> AnalysisResult:
    return AnalysisResult(
        company="Acme Corp",
        market="CRM software",
        incumbents=mock_incumbents,
        emerging=mock_emerging,
        market_sizing=mock_market_sizing,
        synthesis=mock_synthesis,
        created_at=datetime(2026, 1, 1),
    )


@pytest.fixture
def valid_guardrail_result() -> MagicMock:
    return make_run_result(InputValidation(is_valid=True, reason="Valid input"))


@pytest.fixture
def invalid_guardrail_result() -> MagicMock:
    return make_run_result(InputValidation(is_valid=False, reason="Not a real company"))


@pytest_asyncio.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client
