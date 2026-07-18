"""分词过滤器：小写化、单字过滤。"""
from __future__ import annotations


def normalize(word: str) -> str:
    """英文小写化 + 去首尾空白。

    设计文档：Hello 和 hello 合并计数。
    中文不受影响（中文无大小写）。
    """
    return word.strip().lower()


def is_too_short(word: str) -> bool:
    """单字过滤。

    判定规则：len(word) < 2 → 过滤（如"的"、"a"、"I"——语义太弱）。
    """
    return len(word) < 2
