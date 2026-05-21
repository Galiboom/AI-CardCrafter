import asyncio
import json
import re
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
    keyword = normalize_keyword(request.prompt)
    colors = {
        "xiaohongshu": {"from": "#fb7185", "to": "#f97316"},
        "tech": {"from": "#06b6d4", "to": "#2563eb"},
        "commerce": {"from": "#f59e0b", "to": "#ef4444"},
    }

    if request.templateId == "tech":
        return CardPayload.model_validate(
            {
                "title": truncate_title(f"{keyword}方案"),
                "subtitle": f"{keyword}智能营销卡片",
                "content": f"围绕「{request.prompt}」提炼核心卖点，用清晰结构展示价值、场景和转化理由，让用户快速理解为什么现在就值得关注。",
                "tags": ["#AIContent", "#Growth", f"#{keyword[:8]}"],
                "themeColor": colors["tech"],
                "emojiIcon": "⚡",
            }
        )

    if request.templateId == "commerce":
        return CardPayload.model_validate(
            {
                "title": truncate_title(f"{keyword}热卖"),
                "subtitle": f"{keyword}限时主推",
                "content": f"把「{request.prompt}」包装成清晰的购买理由，突出利益点、使用场景和行动暗示，适合商品主图和促销卡片。",
                "tags": ["限时主推", "卖点提炼", keyword[:8]],
                "themeColor": colors["commerce"],
                "emojiIcon": "🔥",
            }
        )

    return CardPayload.model_validate(
        {
            "title": truncate_title(f"{keyword}种草"),
            "subtitle": f"{keyword}高转化灵感",
            "content": f"根据「{request.prompt}」生成一张更适合社媒传播的种草卡片，语气轻快、卖点明确，适合封面、笔记和短内容预览。",
            "tags": ["#好物推荐", "#内容灵感", f"#{keyword[:8]}"],
            "themeColor": colors["xiaohongshu"],
            "emojiIcon": "✨",
        }
    )


def normalize_keyword(prompt: str) -> str:
    words = re.findall(r"[\u4e00-\u9fa5A-Za-z0-9]+", prompt)
    if not words:
        return "营销卡片"

    keyword = "".join(words)
    return keyword[:10] or "营销卡片"


def truncate_title(title: str) -> str:
    return title[:15]


def sse(data: dict) -> str:
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"
