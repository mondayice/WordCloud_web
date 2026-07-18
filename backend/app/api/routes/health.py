"""GET /api/health：健康检查。"""
from __future__ import annotations

from fastapi import APIRouter

from ...config import settings

router = APIRouter()


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "version": settings.app_version}
