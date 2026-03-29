import logging

from agents import Runner
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from sse_starlette.sse import EventSourceResponse

from app.agents.guardrails import guardrail_agent
from app.models.requests import AnalysisRequest
from app.models.responses import AnalysisResult
from app.services.pipeline import run_analysis, run_analysis_streamed

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api")


async def _check_guardrail(company: str, market: str) -> None:
    from app.config import settings

    if not settings.GUARDRAIL_ENABLED:
        return
    try:
        result = await Runner.run(guardrail_agent, f"{company}, {market}")
        if not result.final_output.is_valid:
            raise HTTPException(status_code=422, detail=result.final_output.reason)
    except HTTPException:
        raise
    except BaseException as exc:
        logger.warning("Guardrail check skipped: %s", type(exc).__name__)


@router.post("/analyze")
async def analyze(req: AnalysisRequest) -> AnalysisResult:
    await _check_guardrail(req.company, req.market)
    try:
        return await run_analysis(req.company, req.market)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}") from exc


@router.post("/analyze/stream")
async def analyze_stream(req: AnalysisRequest) -> Response:
    await _check_guardrail(req.company, req.market)
    return EventSourceResponse(run_analysis_streamed(req.company, req.market))
