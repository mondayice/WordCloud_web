"""字体注册表。core/ 层不依赖 FastAPI。"""
from __future__ import annotations

from pathlib import Path


class FontRegistry:
    """字体注册表。

    字体文件存放在 backend/app/fonts/ 下，随代码一起分发。
    用户需手动下载 NotoSansCJKsc-Regular.otf 放入此目录（README 说明）。
    """

    def __init__(self, fonts_dir: Path):
        self._dir = fonts_dir
        self._cjk_font: Path | None = None  # 缓存

    def cjk_font_path(self) -> str:
        """返回中文字体绝对路径（wordcloud 的 font_path 参数）。

        不存在则抛 RuntimeError，启动即失败（fail fast）。
        """
        if self._cjk_font is None:
            # 兼容两种文件名：官方 googlefonts/noto-cjk 用 NotoSansCJKsc-Regular.otf
            # 设计文档原文 NotoSansSC-Regular.otf 实际不存在于官方仓库
            for name in (
                "NotoSansCJKsc-Regular.otf",
                "NotoSansSC-Regular.otf",
            ):
                candidate = self._dir / name
                if candidate.exists():
                    self._cjk_font = candidate
                    break
            if self._cjk_font is None:
                raise RuntimeError(
                    f"中文字体缺失：{self._dir}\n"
                    f"期望文件：NotoSansCJKsc-Regular.otf\n"
                    f"下载地址：https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf\n"
                    f"或参考 backend/app/fonts/README.md 的下载说明。"
                )
        return str(self._cjk_font)
