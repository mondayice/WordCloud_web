"""形状 mask 单元测试。"""
from __future__ import annotations

import numpy as np

from app.core.layout.presets import (
    SHAPE_BUILDERS,
    build_preset_mask,
    circle_mask,
    diamond_mask,
    fill_mask,
    heart_mask,
    star_mask,
)


def test_fill_mask_returns_none() -> None:
    assert fill_mask(100, 100) is None


def test_circle_mask_shape_and_dtype() -> None:
    mask = circle_mask(100, 100)
    assert mask.shape == (100, 100)
    assert mask.dtype == np.uint8


def test_circle_mask_center_is_white_corner_is_black() -> None:
    mask = circle_mask(100, 100)
    # 中心是绘制区（255）
    assert mask[50, 50] == 255
    # 四角是禁绘区（0）
    assert mask[0, 0] == 0
    assert mask[0, 99] == 0
    assert mask[99, 0] == 0
    assert mask[99, 99] == 0


def test_diamond_mask() -> None:
    mask = diamond_mask(100, 100)
    assert mask.shape == (100, 100)
    assert mask.dtype == np.uint8
    assert mask[50, 50] == 255  # 中心
    assert mask[0, 0] == 0  # 角落


def test_heart_mask() -> None:
    mask = heart_mask(100, 100)
    assert mask.shape == (100, 100)
    assert mask.dtype == np.uint8


def test_star_mask() -> None:
    mask = star_mask(100, 100)
    assert mask.shape == (100, 100)
    assert mask.dtype == np.uint8


def test_build_preset_mask_dispatch() -> None:
    assert build_preset_mask("fill", 100, 100) is None
    mask = build_preset_mask("circle", 100, 100)
    assert mask is not None
    assert mask.shape == (100, 100)


def test_build_preset_mask_unknown_shape() -> None:
    try:
        build_preset_mask("hexagon", 100, 100)
        assert False, "应该抛 ValueError"
    except ValueError as e:
        assert "未知形状" in str(e)


def test_all_shapes_registered() -> None:
    assert set(SHAPE_BUILDERS.keys()) == {"fill", "circle", "diamond", "heart", "star"}
