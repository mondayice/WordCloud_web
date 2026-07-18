"""配色函数：预设配色、自定义校验、统一解析、构建 color_func。"""
from __future__ import annotations

import random
import re
from typing import Callable

# 预设配色（与 presets.json 保持一致）
COLOR_SCHEMES: dict[str, list[str]] = {
    "stone": ["#1C1917", "#57534E", "#A8A29E", "#D6D3D1"],
    "sunset": ["#EA580C", "#F97316", "#FB923C", "#FDBA74"],
    "ocean": ["#0C4A6E", "#0369A1", "#0EA5E9", "#7DD3FC"],
    "forest": ["#14532D", "#16A34A", "#4ADE80", "#BBF7D0"],
    "vibrant": ["#DC2626", "#EA580C", "#EAB308", "#16A34A", "#2563EB", "#7C3AED"],
    # 暮色：冷灰蓝调 + 一个橙色点缀（#D49C6B），偏莫兰迪风格
    "dusk": ["#252B31", "#5E6668", "#C1C8C7", "#F6FAFB", "#D49C6B", "#000000"],
}

# 自定义配色颜色数量限制（与前端 custom_color_limits 一致，是唯一真相源）
CUSTOM_COLOR_MIN = 2
CUSTOM_COLOR_MAX = 12

# HEX 校验正则：#RRGGBB（大小写不敏感）
_HEX_PATTERN = re.compile(r"^#[0-9A-Fa-f]{6}$")


def _hex_to_rgb(hex_str: str) -> tuple[int, int, int]:
    """HEX 字符串 → RGB 三元组。调用前需已通过 _HEX_PATTERN 校验。"""
    hex_str = hex_str.lstrip("#")
    return tuple(int(hex_str[i : i + 2], 16) for i in (0, 2, 4))  # type: ignore[return-value]


def validate_colors(colors: list[str]) -> list[str]:
    """校验自定义颜色数组，返回大写化的合法 HEX 列表。

    校验规则（与前端一致）：
    - 数量在 [CUSTOM_COLOR_MIN, CUSTOM_COLOR_MAX]
    - 每项匹配 #RRGGBB 格式
    失败抛 ValueError，由路由层捕获转为 HTTPException。
    """
    if not CUSTOM_COLOR_MIN <= len(colors) <= CUSTOM_COLOR_MAX:
        raise ValueError(
            f"颜色数量必须在 {CUSTOM_COLOR_MIN}-{CUSTOM_COLOR_MAX} 之间，当前 {len(colors)}"
        )
    normalized = []
    for i, c in enumerate(colors):
        if not isinstance(c, str) or not _HEX_PATTERN.match(c):
            raise ValueError(f"第 {i + 1} 个颜色格式无效：{c!r}（需 #RRGGBB）")
        normalized.append(c.upper())
    return normalized


def resolve_colors(
    scheme_key: str | None = None,
    colors: list[str] | None = None,
) -> list[str]:
    """解析配色来源，返回 HEX 列表。

    优先级：colors（自定义）> scheme_key（预设）> 默认 stone。
    两者都未提供则回退到 stone 预设。
    """
    if colors is not None:
        return validate_colors(colors)
    if scheme_key is not None and scheme_key in COLOR_SCHEMES:
        return COLOR_SCHEMES[scheme_key]
    # 默认回退
    return COLOR_SCHEMES["stone"]


def build_color_func(hex_colors: list[str]) -> Callable[..., tuple[int, int, int]]:
    """根据 HEX 列表构建 wordcloud 的 color_func。

    策略：按 font_size 映射色板索引——大词用色板前部（通常更深），
    小词用后部。加随机扰动避免同字号词全同色。
    """
    rgb_colors = [_hex_to_rgb(c) for c in hex_colors]
    n = len(rgb_colors)

    def color_func(
        word: str,
        font_size: int,
        position: tuple[int, int],
        orientation: int,
        random_state: random.Random | None = None,
        **kwargs: object,
    ) -> tuple[int, int, int]:
        # 按字号映射色板索引：大词用色板前部（通常更深），小词用后部
        # font_size 范围大致 [8, 100+]，归一化到 [0, n-1]
        # 用反向映射：字号越大 → idx 越小（前部）；字号越小 → idx 越大（后部）
        font_ratio = min(max(font_size, 0), 100) / 100
        idx = int((1 - font_ratio) * (n - 1))
        idx = max(0, min(idx, n - 1))
        # 加一点随机扰动，避免同字号词全同色
        rng = random_state if random_state is not None else random
        idx = max(0, min(idx + rng.randint(-1, 1), n - 1))  # type: ignore[union-attr]
        return rgb_colors[idx]

    return color_func
