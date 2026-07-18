"""分词 schemas：词频项 + 分词响应。"""
from __future__ import annotations

from pydantic import BaseModel


class WordFrequency(BaseModel):
    word: str
    count: int


class TokenizeResponse(BaseModel):
    frequencies: list[WordFrequency]
    total_words: int
    unique_words: int
