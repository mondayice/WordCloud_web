"""应用启动/关闭钩子。

main.py 拥有唯一的 create_app()；本模块只导出 lifespan 上下文管理器。
"""
from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

import jieba
from fastapi import FastAPI

from .config import settings
from .core.tokenizer.stopwords import StopwordSource
from .fonts.registry import FontRegistry


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    # ===== 启动 =====
    # 1. 预热 jieba（加载默认词典到内存，约 80MB，避免首次请求卡 2s）
    jieba.initialize()

    # 2. 校验中文字体存在（启动即失败，而非请求时失败）
    fonts = FontRegistry(settings.fonts_dir)
    fonts.cjk_font_path()  # 不存在则抛 RuntimeError

    # 3. 加载停用词到内存
    stopwords = StopwordSource(settings.data_dir / "stopwords")

    # 4. 挂载到 app.state，供路由依赖注入
    app.state.fonts = fonts
    app.state.stopwords = stopwords

    yield

    # ===== 关闭 =====
    # 无外部资源需清理
