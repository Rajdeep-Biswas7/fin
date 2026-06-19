from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./finpilot.db"
    REDIS_URL: str = "redis://localhost:6379"
    SECRET_KEY: str = "finpilot2024xK9mPqLdRvNwTjHsAcBe"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    OPENAI_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()