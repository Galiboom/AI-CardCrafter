import asyncio
import json
from collections.abc import AsyncGenerator

import httpx

from .config import settings
from .schemas import CardPayload, GenerateRequest


SYSTEM_PROMPT = """
You are a senior Chinese marketing card copywriter and visual direction assistant.
Return one JSON object only. It must match this schema exactly:
{
  "title": "string, Chinese title <= 15 chars",
  "subtitle": "string",
  "content": "string with concise persuasive marketing copy, emoji allowed",
  "tags": ["string"],
  "themeColor": {"from": "hex color", "to": "hex color"},
  "emojiIcon": "single emoji"
}
Do not include markdown or extra commentary.
"""


TEMPLATE_HINTS = {
    "xiaohongshu": "小红书爆款种草风：强情绪标题、生活方式表达、标签带 #。",
    "tech": "科技极客风：高可信、参数感、简洁锋利，标签可使用英文或短词。",
    "commerce": "电商促销风：突出利益点、上新、限时、转化感。",
}


async def generate_card_payload(request: GenerateRequest) -> CardPayload:
    if not settings.openai_api_key:
        return mock_payload(request)

    body = {
        "model": settings.openai_model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"模板风格：{TEMPLATE_HINTS[request.templateId]}\n用户原始需求：{request.prompt}",
            },
        ],
        "temperature": 0.7,
        "response_format": {"type": "json_object"},
    }

    async with httpx.AsyncClient(timeout=45) as client:
        response = await client.post(
            f"{settings.openai_base_url.rstrip('/')}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openai_api_key}",
                "Content-Type": "application/json",
            },
            json=body,
        )
        response.raise_for_status()
        data = response.json()

    content = data["choices"][0]["message"]["content"]
    return CardPayload.model_validate_json(content)


async def stream_payload_as_patches(payload: CardPayload) -> AsyncGenerator[str, None]:
    data = payload.model_dump(by_alias=True)
    field_order = [
        ("emojiIcon", data["emojiIcon"]),
        ("title", data["title"]),
        ("subtitle", data.get("subtitle") or ""),
        ("content", data["content"]),
        ("tags", data["tags"]),
        ("themeColor.from", data["themeColor"]["from"]),
        ("themeColor.to", data["themeColor"]["to"]),
    ]

    for field, value in field_order:
        if isinstance(value, str):
            current = ""
            step = 2 if field == "content" else 1
            for index in range(0, len(value), step):
                current += value[index : index + step]
                yield sse({"type": "patch", "field": field, "value": current})
                await asyncio.sleep(0.025 if field == "content" else 0.045)
        else:
            yield sse({"type": "patch", "field": field, "value": value})
            await asyncio.sleep(0.08)

    yield sse({"type": "final", "payload": data})
    yield "data: [DONE]\n\n"


def mock_payload(request: GenerateRequest) -> CardPayload:
    if request.templateId == "tech":
        return CardPayload.model_validate(
            {
                "title": "夜跑防雨系统",
                "subtitle": "白色轻量运动鞋",
                "content": "高密防泼水鞋面、稳定抓地纹路与夜间反光识别，把雨后夜跑变成更轻、更稳、更安心的城市训练体验。",
                "tags": ["#WaterReady", "#NightRun", "#UrbanGear"],
                "themeColor": {"from": "#06b6d4", "to": "#2563eb"},
                "emojiIcon": "⚡",
            }
        )

    if request.templateId == "commerce":
        return CardPayload.model_validate(
            {
                "title": "防雨白鞋爆款",
                "subtitle": "夜跑通勤一双搞定",
                "content": "高颜值白色鞋身配防泼水科技，雨后路面也能清爽开跑。限时上新福利，适合通勤、健身和日常穿搭。",
                "tags": ["限时上新", "防泼水", "夜跑推荐"],
                "themeColor": {"from": "#f59e0b", "to": "#ef4444"},
                "emojiIcon": "🔥",
            }
        )

    return CardPayload.model_validate(
        {
            "title": "雨夜也发光",
            "subtitle": "高颜值白色防雨跑鞋",
            "content": "防泼水鞋面不怕小雨，轻盈脚感适合夜跑和通勤。反光细节让夜间更醒目，白色外观随手一拍都很出片。",
            "tags": ["#好物推荐", "#夜跑神器", "#白鞋穿搭"],
            "themeColor": {"from": "#fb7185", "to": "#f97316"},
            "emojiIcon": "✨",
        }
    )


def sse(data: dict) -> str:
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"
