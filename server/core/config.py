import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))

class Settings:
    PROJECT_NAME: str = "StudioOracle Decision Intelligence API"
    VERSION: str = "2.0.0"
    
    CLICKHOUSE_HOST: str = os.getenv("CLICKHOUSE_HOST", "localhost")
    CLICKHOUSE_PORT: int = int(os.getenv("CLICKHOUSE_PORT", "8443"))
    CLICKHOUSE_USER: str = os.getenv("CLICKHOUSE_USER", "default")
    CLICKHOUSE_PASSWORD: str = os.getenv("CLICKHOUSE_PASSWORD", "")
    CLICKHOUSE_SECURE: bool = os.getenv("CLICKHOUSE_SECURE", "true").lower() == "true"
    
    SQLITE_DB_PATH: str = "sessions.db"
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

settings = Settings()
