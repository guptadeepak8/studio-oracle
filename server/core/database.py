import sqlite3
import clickhouse_connect
from core.config import settings

_clickhouse_client_instance = None

def get_clickhouse_client():
    global _clickhouse_client_instance
    if _clickhouse_client_instance is not None:
        try:
            _clickhouse_client_instance.ping()
            return _clickhouse_client_instance
        except Exception:
            _clickhouse_client_instance = None

    _clickhouse_client_instance = clickhouse_connect.get_client(
        host=settings.CLICKHOUSE_HOST,
        port=settings.CLICKHOUSE_PORT,
        username=settings.CLICKHOUSE_USER,
        password=settings.CLICKHOUSE_PASSWORD,
        secure=settings.CLICKHOUSE_SECURE,
        verify=True,
        connect_timeout=15,
        send_receive_timeout=30
    )
    return _clickhouse_client_instance

def get_sqlite_connection(timeout: float = 30.0) -> sqlite3.Connection:
    conn = sqlite3.connect(settings.SQLITE_DB_PATH, timeout=timeout)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    return conn

def init_sqlite_db() -> None:
    conn = get_sqlite_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS campaign_statuses (
            content_id TEXT PRIMARY KEY,
            status TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()
