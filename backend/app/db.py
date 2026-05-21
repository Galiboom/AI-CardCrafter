import sqlite3
from pathlib import Path
from contextlib import suppress

from .config import settings
from .schemas import CardPayload, GenerateRequest


def database_path() -> Path:
    if settings.vercel and settings.app_database_url == "sqlite:///./ai_card_crafter.db":
        return Path("/tmp/ai_card_crafter.db")
    if settings.app_database_url.startswith("sqlite:///"):
        configured_path = settings.app_database_url.replace("sqlite:///", "", 1)
        if configured_path.startswith("/"):
            return Path(configured_path)
        return Path(configured_path)
    return Path("ai_card_crafter.db")


def init_db() -> None:
    path = database_path()
    path.parent.mkdir(parents=True, exist_ok=True)

    with sqlite3.connect(path) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS generations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                prompt TEXT NOT NULL,
                template_id TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )


def save_generation(request: GenerateRequest, payload: CardPayload) -> None:
    with sqlite3.connect(database_path()) as conn:
        conn.execute(
            """
            INSERT INTO generations (prompt, template_id, payload_json)
            VALUES (?, ?, ?)
            """,
            (
                request.prompt,
                request.templateId,
                payload.model_dump_json(by_alias=True),
            ),
        )


def safe_init_db() -> None:
    with suppress(sqlite3.Error, OSError):
        init_db()


def safe_save_generation(request: GenerateRequest, payload: CardPayload) -> None:
    with suppress(sqlite3.Error, OSError):
        save_generation(request, payload)
