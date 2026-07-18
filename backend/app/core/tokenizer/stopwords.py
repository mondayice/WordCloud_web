"""停用词加载：内置 + 用户自定义合并视图。"""
from __future__ import annotations

from pathlib import Path
from typing import Iterable


class StopwordSource:
    """合并内置 + 用户自定义停用词。

    内置停用词存放在 data/stopwords/{en,zh}.txt，每行一个词。
    启动时一次性加载到内存 set，查询 O(1)。
    """

    def __init__(self, builtin_dir: Path, extra: Iterable[str] = ()):
        self._words: set[str] = set()
        if builtin_dir.exists():
            for f in builtin_dir.glob("*.txt"):
                self._words.update(
                    line.strip().lower()
                    for line in f.read_text(encoding="utf-8").splitlines()
                    if line.strip() and not line.startswith("#")
                )
        self._words.update(w.lower() for w in extra)

    def contains(self, word: str) -> bool:
        return word.lower() in self._words

    def as_set(self) -> set[str]:
        return self._words.copy()
