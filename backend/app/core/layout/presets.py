"""5 种预设形状的 mask 生成（numpy 数学公式）。"""
from __future__ import annotations

import numpy as np


def fill_mask(width: int, height: int) -> None:
    """铺满模式：返回 None，wordcloud 自由布局整个画布。"""
    return None


def circle_mask(width: int, height: int) -> np.ndarray:
    """圆形：到中心距离 ≤ 半径。"""
    cx, cy = (width - 1) / 2, (height - 1) / 2
    r = min(width, height) * 0.45
    y, x = np.ogrid[:height, :width]
    inside = (x - cx) ** 2 + (y - cy) ** 2 <= r**2
    return np.where(inside, 255, 0).astype(np.uint8)


def diamond_mask(width: int, height: int) -> np.ndarray:
    """菱形：|x-cx|/a + |y-cy|/b ≤ 1。"""
    cx, cy = (width - 1) / 2, (height - 1) / 2
    a = width * 0.48
    b = height * 0.48
    y, x = np.ogrid[:height, :width]
    inside = np.abs(x - cx) / a + np.abs(y - cy) / b <= 1
    return np.where(inside, 255, 0).astype(np.uint8)


def heart_mask(width: int, height: int) -> np.ndarray:
    """心形：(x²+y²-1)³ - x²y³ ≤ 0。

    使用标准心形方程，缩放至画布大小。
    坐标系：原点在画布中心，y 轴向上。
    """
    # 归一化坐标 [-1.5, 1.5]
    x = np.linspace(-1.5, 1.5, width)
    y = np.linspace(1.5, -1.5, height)  # y 轴翻转（图像坐标向下）
    xx, yy = np.meshgrid(x, y)
    inside = (xx**2 + yy**2 - 1) ** 3 - xx**2 * yy**3 <= 0
    return np.where(inside, 255, 0).astype(np.uint8)


def star_mask(width: int, height: int, points: int = 5) -> np.ndarray:
    """星型：极坐标 N 角星。"""
    cx, cy = (width - 1) / 2, (height - 1) / 2
    R = min(width, height) * 0.48
    N = points
    # 内径公式（正 N 角星）
    r = R * np.sin(np.pi / N) / np.sin(np.pi * (N + 2) / (2 * N))

    y, x = np.ogrid[:height, :width]
    dx = x - cx
    dy = y - cy
    theta = np.arctan2(-dy, dx)  # y 轴翻转使 0° 朝上
    rho = np.sqrt(dx**2 + dy**2)

    seg = (theta % (2 * np.pi / N)) / (2 * np.pi / N)  # [0, 1)
    # 在每个 N 段内用余弦平滑近似星形边界（外径 R、内径 r）
    boundary = R - (R - r) * np.abs(np.cos(seg * np.pi))
    inside = rho <= boundary
    return np.where(inside, 255, 0).astype(np.uint8)


# 形状注册表（不含 "mask"——用户图走 mask_from_image 单独分支）
SHAPE_BUILDERS = {
    "fill": fill_mask,
    "circle": circle_mask,
    "diamond": diamond_mask,
    "heart": heart_mask,
    "star": star_mask,
}


def build_preset_mask(shape: str, width: int, height: int) -> np.ndarray | None:
    """根据形状 key 生成 mask。未知形状抛 ValueError。"""
    builder = SHAPE_BUILDERS.get(shape)
    if builder is None:
        raise ValueError(f"未知形状：{shape}")
    return builder(width, height)
