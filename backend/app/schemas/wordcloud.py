"""词云相关枚举。"""
from __future__ import annotations

from enum import Enum


class ShapeEnum(str, Enum):
    FILL = "fill"
    DIAMOND = "diamond"
    HEART = "heart"
    CIRCLE = "circle"
    STAR = "star"
    MASK = "mask"


class ExportFormat(str, Enum):
    PNG = "png"
    SVG = "svg"
