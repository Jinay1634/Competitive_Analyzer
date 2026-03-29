from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient

from app.models.responses import AnalysisResult

ANALYZE_URL = "/api/analyze"
STREAM_URL = "/api/analyze/stream"
VALID_PAYLOAD = {"company": "Acme Corp", "market": "CRM software"}


@pytest.mark.asyncio
async def test_analyze_200(
    async_client: AsyncClient,
    valid_guardrail_result: MagicMock,
    mock_analysis_result: AnalysisResult,
) -> None:
    with (
        patch("app.routers.analysis.Runner.run", new_callable=AsyncMock, return_value=valid_guardrail_result),
        patch("app.routers.analysis.run_analysis", new_callable=AsyncMock, return_value=mock_analysis_result),
    ):
        response = await async_client.post(ANALYZE_URL, json=VALID_PAYLOAD)

    assert response.status_code == 200
    body = response.json()
    assert body["company"] == "Acme Corp"
    assert body["market"] == "CRM software"
    assert body["synthesis"]["recommendation"] in ("GO", "NO_GO", "CONDITIONAL")


@pytest.mark.asyncio
async def test_analyze_422_guardrail(
    async_client: AsyncClient,
    invalid_guardrail_result: MagicMock,
) -> None:
    with patch("app.routers.analysis.Runner.run", new_callable=AsyncMock, return_value=invalid_guardrail_result):
        response = await async_client.post(ANALYZE_URL, json=VALID_PAYLOAD)

    assert response.status_code == 422
    assert "Not a real company" in response.json()["detail"]


@pytest.mark.asyncio
async def test_analyze_422_missing_field(async_client: AsyncClient) -> None:
    response = await async_client.post(ANALYZE_URL, json={"company": "Acme"})
    assert response.status_code == 422  # FastAPI validation


@pytest.mark.asyncio
async def test_analyze_500(
    async_client: AsyncClient,
    valid_guardrail_result: MagicMock,
) -> None:
    with (
        patch("app.routers.analysis.Runner.run", new_callable=AsyncMock, return_value=valid_guardrail_result),
        patch("app.routers.analysis.run_analysis", new_callable=AsyncMock, side_effect=RuntimeError("boom")),
    ):
        response = await async_client.post(ANALYZE_URL, json=VALID_PAYLOAD)

    assert response.status_code == 500
    assert "boom" in response.json()["detail"]


@pytest.mark.asyncio
async def test_analyze_stream_200(
    async_client: AsyncClient,
    valid_guardrail_result: MagicMock,
    mock_analysis_result: AnalysisResult,
) -> None:
    async def _fake_stream(company: str, market: str):  # type: ignore[no-untyped-def]
        yield {"event": "progress", "data": '{"step":"incumbents","status":"running"}'}
        yield {"event": "complete", "data": mock_analysis_result.model_dump_json()}

    with (
        patch("app.routers.analysis.Runner.run", new_callable=AsyncMock, return_value=valid_guardrail_result),
        patch("app.routers.analysis.run_analysis_streamed", side_effect=_fake_stream),
    ):
        response = await async_client.post(STREAM_URL, json=VALID_PAYLOAD)

    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]
