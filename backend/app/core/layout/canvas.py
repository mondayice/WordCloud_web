"""自适应画布宽高比 clamp。"""
from __future__ import annotations


def clamp_aspect_ratio(
    width: int, height: int, lo: float = 0.5, hi: float = 1.5
) -> tuple[int, int]:
    """自适应画布宽高比，clamp 到 [0.5, 1.5]。

    设计文档要求：让形状贴合画布。
    当 height/width < 0.5 时，拉高 height；> 1.5 时，压低 height。
    """
    ratio = height / width
    if ratio < lo:
        return width, int(width * lo)
    if ratio > hi:
        return width, int(width * hi)
    return width, height
