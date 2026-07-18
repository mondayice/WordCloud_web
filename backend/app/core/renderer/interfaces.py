"""渲染层抽象与产物封装。"""
from __future__ import annotations

from collections import Counter
from typing import Any, Protocol

import numpy as np


class RenderResult:
    """渲染产物：封装 wordcloud 对象，延迟导出。"""

    def __init__(self, wc: Any):  # wc: wordcloud.WordCloud
        self._wc = wc

    def to_array(self) -> np.ndarray:
        return self._wc.to_array()

    def to_svg(self) -> str:
        return self._wc.to_svg(embed_image=True)


class Renderer(Protocol):
    def render(
        self,
        frequencies: Counter,
        width: int,
        height: int,
        mask: np.ndarray | None,
        *,
        colors: list[str],
        background: str,
        prefer_horizontal: float = 0.9,
        min_font_size: int = 8,
        max_font_size: int | None = None,
        rotation_steps: int = 0,
    ) -> RenderResult: ...
