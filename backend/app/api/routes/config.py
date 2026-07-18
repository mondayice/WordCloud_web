"""GET /api/config：返回预设清单。"""
from __future__ import annotations

import json

from fastapi import APIRouter

from ...config import settings
from ...schemas.common import ConfigResponse

router = APIRouter()

# 启动时加载一次，避免每次请求读磁盘
_presets_cache: ConfigResponse | None = None


def _load_presets() -> ConfigResponse:
    global _presets_cache
    if _presets_cache is None:
        data = json.loads(
            (settings.data_dir / "presets.json").read_text(encoding="utf-8")
        )
        _presets_cache = ConfigResponse(**data)
    return _presets_cache


@router.get("/config", response_model=ConfigResponse)
async def get_config() -> ConfigResponse:
    """返回预设清单（形状/配色/尺寸/自定义色限制）。"""
    return _load_presets()
