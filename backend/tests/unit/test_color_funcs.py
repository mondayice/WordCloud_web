"""配色函数单元测试。"""
from __future__ import annotations

import pytest

from app.core.renderer.color_funcs import (
    COLOR_SCHEMES,
    CUSTOM_COLOR_MAX,
    CUSTOM_COLOR_MIN,
    build_color_func,
    resolve_colors,
    validate_colors,
)


# ============ validate_colors ============

def test_validate_colors_valid() -> None:
    result = validate_colors(["#EA580C", "#1C1917"])
    assert result == ["#EA580C", "#1C1917"]


def test_validate_colors_uppercase_normalization() -> None:
    result = validate_colors(["#ea580c", "#1c1917"])
    assert result == ["#EA580C", "#1C1917"]


def test_validate_colors_max_boundary() -> None:
    colors = ["#000000"] * CUSTOM_COLOR_MAX
    result = validate_colors(colors)
    assert len(result) == CUSTOM_COLOR_MAX


def test_validate_colors_too_few() -> None:
    with pytest.raises(ValueError, match="颜色数量"):
        validate_colors(["#000000"])


def test_validate_colors_too_many() -> None:
    with pytest.raises(ValueError, match="颜色数量"):
        validate_colors(["#000000"] * (CUSTOM_COLOR_MAX + 1))


def test_validate_colors_invalid_hex_format() -> None:
    with pytest.raises(ValueError, match="格式无效"):
        validate_colors(["#GGGGGG", "#1C1917"])


def test_validate_colors_short_hex_not_supported() -> None:
    """不支持 #RGB 三位缩写。"""
    with pytest.raises(ValueError, match="格式无效"):
        validate_colors(["#FFF", "#000"])


def test_validate_colors_no_alpha() -> None:
    """不支持 #RRGGBBAA 八位带 alpha。"""
    with pytest.raises(ValueError, match="格式无效"):
        validate_colors(["#EA580CFF", "#1C1917FF"])


# ============ resolve_colors ============

def test_resolve_colors_custom_priority() -> None:
    """colors 优先于 scheme_key。"""
    result = resolve_colors(scheme_key="stone", colors=["#EA580C", "#1C1917"])
    assert result == ["#EA580C", "#1C1917"]


def test_resolve_colors_preset_key() -> None:
    result = resolve_colors(scheme_key="sunset")
    assert result == COLOR_SCHEMES["sunset"]


def test_resolve_colors_unknown_scheme_falls_back() -> None:
    """未知 scheme_key 回退到 stone。"""
    result = resolve_colors(scheme_key="nonexistent")
    assert result == COLOR_SCHEMES["stone"]


def test_resolve_colors_default_fallback() -> None:
    """两者都未提供回退到 stone。"""
    result = resolve_colors()
    assert result == COLOR_SCHEMES["stone"]


def test_resolve_colors_invalid_custom_raises() -> None:
    with pytest.raises(ValueError):
        resolve_colors(colors=["#bad"])


# ============ build_color_func ============

def test_build_color_func_returns_callable() -> None:
    func = build_color_func(["#EA580C", "#1C1917"])
    assert callable(func)


def test_build_color_func_returns_rgb_tuple() -> None:
    func = build_color_func(["#EA580C", "#1C1917"])
    result = func(word="test", font_size=50, position=(0, 0), orientation=0)
    assert isinstance(result, tuple)
    assert len(result) == 3
    for v in result:
        assert 0 <= v <= 255


def test_build_color_func_in_palette_range() -> None:
    """返回的颜色应在输入色板中。"""
    palette = ["#EA580C", "#1C1917", "#FAFAF9"]
    func = build_color_func(palette)
    result = func(word="test", font_size=50, position=(0, 0), orientation=0)
    # 由于有随机扰动 ±1，多次调用应落在 palette 中
    hex_result = "#{:02X}{:02X}{:02X}".format(*result)
    assert hex_result in palette


def test_build_color_func_large_font_uses_first_colors() -> None:
    """大字号应倾向于使用色板前部。"""
    palette = ["#FF0000", "#00FF00", "#0000FF"]
    func = build_color_func(palette)
    # 字号 100 → idx = 0
    result = func(word="test", font_size=100, position=(0, 0), orientation=0)
    hex_result = "#{:02X}{:02X}{:02X}".format(*result)
    # 扰动 ±1 后仍应在 [0, 1]，即 palette[0] 或 palette[1]
    assert hex_result in ["#FF0000", "#00FF00"]


def test_color_schemes_have_required_keys() -> None:
    """预设配色必须包含 5 个 key。"""
    expected = {"stone", "sunset", "ocean", "forest", "vibrant"}
    assert set(COLOR_SCHEMES.keys()) == expected


def test_color_limits_consistent() -> None:
    assert CUSTOM_COLOR_MIN == 2
    assert CUSTOM_COLOR_MAX == 12
