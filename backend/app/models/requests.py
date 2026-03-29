from pydantic import BaseModel, Field


class AnalysisRequest(BaseModel):
    company: str = Field(min_length=1, description="Company to evaluate")
    market: str = Field(min_length=1, description="Market/product space to analyze")
