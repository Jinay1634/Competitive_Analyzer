from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file="../.env", env_file_encoding="utf-8", extra="ignore")

    CORS_ORIGINS: str = "http://localhost:5173,http://localhost"

    OPENAI_API_KEY: str
    ANTHROPIC_API_KEY: str
    GEMINI_API_KEY: str
    RESEARCH_MODEL: str = "gpt-4o"
    SYNTHESIS_MODEL: str = "anthropic/claude-sonnet-4-5-20250929"
    GUARDRAIL_MODEL: str = "gemini/gemini-2.0-flash"
    GUARDRAIL_ENABLED: bool = True


settings = Settings()
