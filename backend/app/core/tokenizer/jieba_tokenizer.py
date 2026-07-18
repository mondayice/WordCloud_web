"""jieba 分词实现。"""
from __future__ import annotations

from collections import Counter
from pathlib import Path

import jieba

from .filters import is_too_short, normalize
from .interfaces import StopwordSourceProtocol
from .text_segmenter import segment_cjk_latin


class JiebaTokenizer:
    """jieba 分词实现。

    线程安全说明：jieba 的 cut/apply 在内部用 threading.Lock 保护，
    可在 FastAPI 线程池中并发调用。
    """

    def __init__(
        self, stopword_source: StopwordSourceProtocol, user_dict: Path | None = None
    ):
        self._stop = stopword_source
        if user_dict:
            jieba.load_userdict(str(user_dict))

    def tokenize(self, text: str) -> Counter:
        counter: Counter[str] = Counter()
        for segment in segment_cjk_latin(text):
            for raw in jieba.cut(segment):
                word = normalize(raw)  # 英文小写化、去首尾空白
                if is_too_short(word):  # len < 2 过滤
                    continue
                if self._stop.contains(word):
                    continue
                counter[word] += 1
        return counter
