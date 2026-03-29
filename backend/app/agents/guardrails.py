from agents import Agent, GuardrailFunctionOutput, Runner, input_guardrail
from agents.extensions.models.litellm_model import LitellmModel

from app.config import settings
from app.models.responses import InputValidation

guardrail_agent: Agent[InputValidation] = Agent(
    name="Input Validator",
    model=LitellmModel(model=settings.GUARDRAIL_MODEL),
    instructions=(
        "Check if the input contains a real company name and a real market/product space. "
        "Return is_valid=False if the company or market is gibberish, fictional, or missing."
    ),
    output_type=InputValidation,
)


@input_guardrail
async def validate_input(ctx, agent, input):  # type: ignore[no-untyped-def]
    result = await Runner.run(guardrail_agent, input, context=ctx.context)
    return GuardrailFunctionOutput(
        tripwire_triggered=not result.final_output.is_valid,
        output_info=result.final_output,
    )
