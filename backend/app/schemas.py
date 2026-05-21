from typing import Literal

from pydantic import BaseModel, Field, field_validator


TemplateId = Literal["xiaohongshu", "tech", "commerce"]


class ThemeColor(BaseModel):
    from_: str = Field(alias="from", min_length=1)
    to: str = Field(min_length=1)

    model_config = {"populate_by_name": True}


class CardPayload(BaseModel):
    title: str = Field(min_length=1, max_length=15)
    subtitle: str | None = None
    content: str = Field(min_length=1)
    tags: list[str] = Field(min_length=1, max_length=6)
    themeColor: ThemeColor
    emojiIcon: str = Field(min_length=1, max_length=8)

    @field_validator("tags")
    @classmethod
    def tags_must_have_text(cls, value: list[str]) -> list[str]:
        tags = [tag.strip() for tag in value if tag.strip()]
        if not tags:
            raise ValueError("tags must contain at least one value")
        return tags


class GenerateRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=1200)
    templateId: TemplateId
