"""API 路由汇总。"""
from __future__ import annotations

from fastapi import APIRouter

from .routes import config, health, tokenize, wordcloud

api_router = APIRouter(prefix="/api")
api_router.include_router(config.router, tags=["config"])
api_router.include_router(tokenize.router, tags=["tokenize"])
api_router.include_router(wordcloud.router, tags=["wordcloud"])
api_router.include_router(health.router, tags=["health"])
