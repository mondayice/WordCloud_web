"""布局层抽象。"""
from __future__ import annotations

from typing import Protocol

import numpy as np


class MaskProvider(Protocol):
    """生成 wordcloud 所需的 mask（ndarray）。

    约定：mask 中白色（255）区域表示"可绘制词"，黑色（0）表示"禁绘区"。
    这是 wordcloud 库的约定。
    """

    def build(self, width: int, height: int) -> np.ndarray | None:
        """返回 None 表示无 mask（铺满模式）。"""
        ...
