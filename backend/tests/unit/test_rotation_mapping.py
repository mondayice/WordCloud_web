"""WordCloudRenderer 旋转角度映射单元测试。"""
from __future__ import annotations

from app.core.renderer.wordcloud_renderer import ROTATION_TO_PREFER_HORIZONTAL


def test_rotation_mapping_has_5_levels() -> None:
    """5 档旋转角度。"""
    assert set(ROTATION_TO_PREFER_HORIZONTAL.keys()) == {0, 30, 45, 60, 90}


def test_rotation_zero_means_all_horizontal() -> None:
    """0° = 全水平（prefer_horizontal=1.0）。"""
    assert ROTATION_TO_PREFER_HORIZONTAL[0] == 1.0


def test_rotation_ninety_means_all_vertical() -> None:
    """90° = 全垂直（prefer_horizontal=0.0）。"""
    assert ROTATION_TO_PREFER_HORIZONTAL[90] == 0.0


def test_rotation_monotonic_decreasing() -> None:
    """角度越大，水平比例越小（单调递减）。"""
    angles = [0, 30, 45, 60, 90]
    values = [ROTATION_TO_PREFER_HORIZONTAL[a] for a in angles]
    for i in range(len(values) - 1):
        assert values[i] > values[i + 1], f"{angles[i]}° 应大于 {angles[i+1]}° 的水平比例"


def test_rotation_45_is_half_half() -> None:
    """45° = 50/50。"""
    assert ROTATION_TO_PREFER_HORIZONTAL[45] == 0.5
