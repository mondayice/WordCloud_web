"""应用配置：pydantic-settings，环境变量前缀 WC_。"""
from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="WC_", env_file=".env", extra="ignore")

    # 路径
    base_dir: Path = Path(__file__).resolve().parent
    static_dir: Path = base_dir / ".." / "static"  # 前端 build 产物
    data_dir: Path = base_dir / "data"
    fonts_dir: Path = base_dir / "fonts"

    # 限制（与设计文档一致）
    max_text_chars: int = 500_000
    max_text_file_bytes: int = 5 * 1024 * 1024  # 5MB
    min_text_chars: int = 20  # 设计文档：≥20 字符
    max_mask_image_bytes: int = 10 * 1024 * 1024  # 10MB

    # 服务
    host: str = "127.0.0.1"  # 本地单机，只绑 loopback
    port: int = 8000

    # 应用
    app_name: str = "WordCloud Studio"
    app_version: str = "0.1.0"


settings = Settings()
