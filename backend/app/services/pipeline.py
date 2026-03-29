import asyncio
import json
from collections.abc import AsyncGenerator
from datetime import datetime

from agents import Runner, trace

from app.agents.emerging import emerging_agent
from app.agents.incumbents import incumbents_agent
from app.agents.market_sizing import market_sizing_agent
from app.agents.synthesis import synthesis_agent
from app.config import settings
from app.models.responses import AnalysisResult, EmergingReport, IncumbentsReport, MarketSizingReport


def _build_synthesis_prompt(
    company: str,
    market: str,
    incumbents: IncumbentsReport,
    emerging: EmergingReport,
    market_sizing: MarketSizingReport,
) -> str:
    return (
        f"Evaluate whether {company} should enter the {market} market.\n\n"
        f"## Incumbents Research\n{incumbents.model_dump_json(indent=2)}\n\n"
        f"## Emerging Competitors Research\n{emerging.model_dump_json(indent=2)}\n\n"
        f"## Market Sizing Research\n{market_sizing.model_dump_json(indent=2)}"
    )


async def run_analysis(company: str, market: str) -> AnalysisResult:
    with trace("competitive-analysis"):
        inc_result, emr_result, mkt_result = await asyncio.gather(
            Runner.run(
                incumbents_agent,
                input=f"Research established competitors in the {market} market.",
            ),
            Runner.run(
                emerging_agent,
                input=f"Research recently funded startups disrupting the {market} market.",
            ),
            Runner.run(
                market_sizing_agent,
                input=f"Research the total addressable market size and growth for the {market} market.",
            ),
        )

        incumbents: IncumbentsReport = inc_result.final_output
        emerging: EmergingReport = emr_result.final_output
        market_sizing: MarketSizingReport = mkt_result.final_output

        synthesis_input = _build_synthesis_prompt(company, market, incumbents, emerging, market_sizing)
        syn_result = await Runner.run(synthesis_agent, input=synthesis_input)

        return AnalysisResult(
            company=company,
            market=market,
            incumbents=incumbents,
            emerging=emerging,
            market_sizing=market_sizing,
            synthesis=syn_result.final_output,
            created_at=datetime.utcnow(),
        )


async def run_analysis_streamed(
    company: str, market: str
) -> AsyncGenerator[dict[str, str], None]:
    yield {
        "event": "progress",
        "data": json.dumps({"step": "incumbents", "status": "running", "model": settings.RESEARCH_MODEL}),
    }
    inc_result = await Runner.run(
        incumbents_agent,
        input=f"Research established competitors in the {market} market.",
    )
    incumbents: IncumbentsReport = inc_result.final_output
    yield {
        "event": "progress",
        "data": json.dumps({
            "step": "incumbents",
            "status": "done",
            "preview": f"Found {len(incumbents.competitors)} established players",
        }),
    }

    yield {
        "event": "progress",
        "data": json.dumps({"step": "emerging", "status": "running", "model": settings.RESEARCH_MODEL}),
    }
    emr_result = await Runner.run(
        emerging_agent,
        input=f"Research recently funded startups disrupting the {market} market.",
    )
    emerging: EmergingReport = emr_result.final_output
    yield {
        "event": "progress",
        "data": json.dumps({
            "step": "emerging",
            "status": "done",
            "preview": f"Found {len(emerging.startups)} funded startups",
        }),
    }

    yield {
        "event": "progress",
        "data": json.dumps({"step": "market_sizing", "status": "running", "model": settings.RESEARCH_MODEL}),
    }
    mkt_result = await Runner.run(
        market_sizing_agent,
        input=f"Research the total addressable market size and growth for the {market} market.",
    )
    market_sizing: MarketSizingReport = mkt_result.final_output
    yield {
        "event": "progress",
        "data": json.dumps({
            "step": "market_sizing",
            "status": "done",
            "preview": f"TAM: {market_sizing.tam}",
        }),
    }

    yield {
        "event": "progress",
        "data": json.dumps({"step": "synthesis", "status": "running", "model": settings.SYNTHESIS_MODEL}),
    }
    synthesis_input = _build_synthesis_prompt(company, market, incumbents, emerging, market_sizing)
    syn_result = await Runner.run(synthesis_agent, input=synthesis_input)
    synthesis = syn_result.final_output
    yield {
        "event": "progress",
        "data": json.dumps({
            "step": "synthesis",
            "status": "done",
            "preview": f"{synthesis.recommendation} — score {synthesis.opportunity_score}/10",
        }),
    }

    result = AnalysisResult(
        company=company,
        market=market,
        incumbents=incumbents,
        emerging=emerging,
        market_sizing=market_sizing,
        synthesis=synthesis,
        created_at=datetime.utcnow(),
    )
    yield {"event": "complete", "data": result.model_dump_json()}
