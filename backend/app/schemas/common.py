"""通用 schemas：配置响应、错误响应、预设数据模型。"""
from __future__ import annotations

from pydantic import BaseModel


class ErrorResponse(BaseModel):
    detail: str
    code: str | None = None


class ShapePreset(BaseModel):
    key: str
    label: str
    requires_mask: bool


class SizePreset(BaseModel):
    key: str
    label: str
    width: int
    height: int


class ColorScheme(BaseModel):
    key: str
    label: str
    colors: list[str]
    builtin: bool = False  # True=预设（只读），False=用户自定义


class CustomColorLimits(BaseModel):
    """自定义配色颜色数量范围（与前端校验一致）。"""

    min: int = 2
    max: int = 12


class ConfigResponse(BaseModel):
    shapes: list[ShapePreset]
    color_schemes: list[ColorScheme]
    size_presets: list[SizePreset]
    custom_color_limits: CustomColorLimits = CustomColorLimits()
