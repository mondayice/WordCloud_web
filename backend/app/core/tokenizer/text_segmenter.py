"""中英文混合分段。"""
from __future__ import annotations

import re

# 匹配连续的 CJK 字符（含扩展区）或连续的非 CJK 字符
_CJK_PATTERN = re.compile(
    r"[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]+|[^ \u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]+"
)


def segment_cjk_latin(text: str) -> list[str]:
    """中英文混合分段。

    示例：
        "AI 让世界更好 world" → ["AI", "让世界更好", "world"]

    设计文档原文示例保留首尾空格，本实现剥离空格，
    因为后续 jieba.cut 会处理空白。
    """
    return [s for s in _CJK_PATTERN.findall(text) if s.strip()]
