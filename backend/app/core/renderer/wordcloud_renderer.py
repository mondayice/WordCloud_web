"""wordcloud 库封装：渲染入口。"""
from __future__ import annotations

from collections import Counter

import numpy as np
from wordcloud import WordCloud

from ...fonts.registry import FontRegistry
from .color_funcs import build_color_func
from .interfaces import RenderResult

# 旋转角度 → 水平排版比例 映射
# wordcloud 库 1.9.x 内部只用 Image.ROTATE_90（90°）旋转，无法支持任意角度。
# 通过 prefer_horizontal 比例间接表达"旋转程度"：
#   角度越大 → 垂直词越多 → prefer_horizontal 越小
# 5 档映射覆盖常见设计场景，前端 UI 同步提供这 5 个选项
ROTATION_TO_PREFER_HORIZONTAL: dict[int, float] = {
    0: 1.0,   # 0°  全水平
    30: 0.7,  # 30° 30% 词垂直
    45: 0.5,  # 45° 50/50
    60: 0.3,  # 60° 70% 词垂直
    90: 0.0,  # 90° 全垂直
}


class WordCloudRenderer:
    """wordcloud 库封装。

    旋转说明：wordcloud 库内部仅支持 0°/90° 二选一（通过 prefer_horizontal 比例）。
    本渲染器把前端 5 档角度（0/30/45/60/90）映射为不同的水平比例，
    在视觉上呈现"旋转程度"的渐进变化。
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
        rotation_steps: int = 0,
    ) -> RenderResult:
        # 把前端角度档位转换为 prefer_horizontal 比例
        # 未知角度值默认回退到 0°（全水平）
        effective_prefer_h = ROTATION_TO_PREFER_HORIZONTAL.get(rotation_steps, 1.0)

        wc_kwargs: dict[str, object] = {
            "font_path": self._fonts.cjk_font_path(),  # 关键：中文字体
            "width": width,
            "height": height,
            "mask": mask,
            "background_color": None if background == "transparent" else background,
            "color_func": build_color_func(colors),  # 配色函数（接收 HEX 列表）
            "prefer_horizontal": effective_prefer_h,
            "min_font_size": min_font_size,
            "max_words": 2000,
            "collocations": False,  # 关键：已分词，关闭词组搭配检测
            "margin": 2,
            "random_state": 42,  # 可复现
        }
        if max_font_size is not None:
            wc_kwargs["max_font_size"] = max_font_size

        wc = WordCloud(**wc_kwargs)
        # 关键：max_font_size 必须显式传给 generate_from_frequencies 才会生效
        # 否则库会自动计算（覆盖构造函数的设置）
        wc.generate_from_frequencies(frequencies, max_font_size=max_font_size)
        return RenderResult(wc)
