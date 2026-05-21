from collections.abc import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from .ai import generate_card_payload, sse, stream_payload_as_patches
from .config import settings
from .db import safe_init_db, safe_save_generation
from .schemas import GenerateRequest


app = FastAPI(title="AI-CardCrafter API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup() -> None:
    safe_init_db()


@app.get("/api/health")
async def health() -> dict[str, str | bool]:
    return {
        "status": "ok",
        "model": settings.openai_model,
        "baseUrl": settings.openai_base_url,
        "hasApiKey": bool(settings.openai_api_key),
        "usingMock": not bool(settings.openai_api_key),
    }


@app.post("/api/cards/generate/stream")
async def generate_stream(request: GenerateRequest) -> StreamingResponse:
    async def event_source() -> AsyncGenerator[str, None]:
        try:
            payload = await generate_card_payload(request)
            safe_save_generation(request, payload)

            async for event in stream_payload_as_patches(payload):
                yield event
        except Exception as exc:
            yield sse({"type": "error", "message": f"AI 生成失败：{exc}"})
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_source(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
