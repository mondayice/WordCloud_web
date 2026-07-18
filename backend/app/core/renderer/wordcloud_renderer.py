"""wordcloud 库封装：渲染入口。"""
from __future__ import annotations

from collections import Counter

import numpy as np
from wordcloud import WordCloud

from ...fonts.registry import FontRegistry
from .color_funcs import build_color_func
from .interfaces import RenderResult


class WordCloudRenderer:
    """wordcloud 库封装。

    注意：wordcloud 库不支持 rotation_steps 参数（它有自己的 rotate_step/random_state 机制），
    这里接收但暂不生效；如需控制旋转，可通过 prefer_horizontal 调整。
    """

    def __init__(self, fonts: FontRegistry):
        self._fonts = fonts

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
        rotation_steps: int = 90,
    ) -> RenderResult:
        # 旋转角度处理：rotation_steps=0 表示完全水平；其他值传给 WordCloud
        # wordcloud 的 prefer_horizontal 控制水平词比例；这里用 0/90 简化
        wc_kwargs: dict[str, object] = {
            "font_path": self._fonts.cjk_font_path(),  # 关键：中文字体
            "width": width,
            "height": height,
            "mask": mask,
            "background_color": None if background == "transparent" else background,
            "color_func": build_color_func(colors),  # 配色函数（接收 HEX 列表）
            "prefer_horizontal": prefer_horizontal,
            "min_font_size": min_font_size,
            "max_words": 2000,
            "collocations": False,  # 关键：已分词，关闭词组搭配检测
            "margin": 2,
            "random_state": 42,  # 可复现
        }
        if max_font_size is not None:
            wc_kwargs["max_font_size"] = max_font_size
        # rotation_steps=0 → 完全水平；非 0 → 默认行为（部分旋转）
        # wordcloud 库通过 prefer_horizontal=1.0 实现完全水平
        if rotation_steps == 0:
            wc_kwargs["prefer_horizontal"] = 1.0

        wc = WordCloud(**wc_kwargs)
        wc.generate_from_frequencies(frequencies)  # 直接传词频
        return RenderResult(wc)
