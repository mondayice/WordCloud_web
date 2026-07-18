"""分词管线抽象。core/ 层不依赖 FastAPI。"""
from __future__ import annotations

from collections import Counter
from typing import Protocol


class Tokenizer(Protocol):
    """分词管线抽象。实现需保证线程安全（jieba 内部已加锁）。"""

    def tokenize(self, text: str) -> Counter:
        """返回词频计数。已应用停用词过滤、长度过滤、小写化。"""
        ...


class StopwordSourceProtocol(Protocol):
    """停用词来源：内置 + 用户自定义的合并视图。"""

    def contains(self, word: str) -> bool: ...

    def as_set(self) -> set[str]: ...
