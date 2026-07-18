"""用户上传图 → 二值化 mask。"""
from __future__ import annotations

from io import BytesIO

import numpy as np
from PIL import Image


def build_mask_from_image(image_bytes: bytes, width: int, height: int) -> np.ndarray:
    """用户上传图 → 二值化 mask。

    策略：
    1. 缩放到目标画布尺寸（LANCZOS 高质量重采样）
    2. 转灰度
    3. 亮度 > 128 = 绘制区（255），否则禁绘区（0）

    注：用户通常上传明确的形状图（如剪影），简单阈值足够。
    """
    img = Image.open(BytesIO(image_bytes)).convert("RGB")
    img = img.resize((width, height), Image.LANCZOS)
    gray = np.array(img.convert("L"))
    return np.where(gray > 128, 255, 0).astype(np.uint8)
