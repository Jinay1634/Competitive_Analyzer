import json
from unittest.mock import AsyncMock, patch

import pytest

from app.models.responses import (
    AnalysisResult,
    EmergingReport,
    IncumbentsReport,
    MarketSizingReport,
    SynthesisReport,
)
from app.services.pipeline import run_analysis, run_analysis_streamed
from tests.conftest import make_run_result


@pytest.mark.asyncio
async def test_run_analysis_calls_all_agents(
    mock_incumbents: IncumbentsReport,
    mock_emerging: EmergingReport,
    mock_market_sizing: MarketSizingReport,
    mock_synthesis: SynthesisReport,
) -> None:
    mock_results = [
        make_run_result(mock_incumbents),
        make_run_result(mock_emerging),
        make_run_result(mock_market_sizing),
        make_run_result(mock_synthesis),
    ]
    with patch("app.services.pipeline.Runner.run", new_callable=AsyncMock, side_effect=mock_results) as mock_run:
        await run_analysis("Acme Corp", "CRM software")

    assert mock_run.call_count == 4


@pytest.mark.asyncio
async def test_run_analysis_result_shape(
    mock_incumbents: IncumbentsReport,
    mock_emerging: EmergingReport,
    mock_market_sizing: MarketSizingReport,
    mock_synthesis: SynthesisReport,
) -> None:
    mock_results = [
        make_run_result(mock_incumbents),
        make_run_result(mock_emerging),
        make_run_result(mock_market_sizing),
        make_run_result(mock_synthesis),
    ]
    with patch("app.services.pipeline.Runner.run", new_callable=AsyncMock, side_effect=mock_results):
        result = await run_analysis("Acme Corp", "CRM software")

    assert isinstance(result, AnalysisResult)
    assert result.company == "Acme Corp"
    assert result.market == "CRM software"
    assert result.synthesis.recommendation in ("GO", "NO_GO", "CONDITIONAL")
    assert 1 <= result.synthesis.opportunity_score <= 10


@pytest.mark.asyncio
async def test_run_analysis_streamed_events(
    mock_incumbents: IncumbentsReport,
    mock_emerging: EmergingReport,
    mock_market_sizing: MarketSizingReport,
    mock_synthesis: SynthesisReport,
) -> None:
    mock_results = [
        make_run_result(mock_incumbents),
        make_run_result(mock_emerging),
        make_run_result(mock_market_sizing),
        make_run_result(mock_synthesis),
    ]
    events: list[dict[str, str]] = []
    with patch("app.services.pipeline.Runner.run", new_callable=AsyncMock, side_effect=mock_results):
        async for event in run_analysis_streamed("Acme Corp", "CRM software"):
            events.append(event)

    # 8 progress events (running + done for each of 4 steps) + 1 complete
    assert len(events) == 9

    # All progress events have the right shape
    progress_events = [e for e in events if e["event"] == "progress"]
    assert len(progress_events) == 8
    for evt in progress_events:
        data = json.loads(evt["data"])
        assert "step" in data
        assert data["status"] in ("running", "done")

    # Final event is complete with full AnalysisResult
    final = events[-1]
    assert final["event"] == "complete"
    result = AnalysisResult.model_validate_json(final["data"])
    assert result.company == "Acme Corp"
    assert result.synthesis.recommendation in ("GO", "NO_GO", "CONDITIONAL")
