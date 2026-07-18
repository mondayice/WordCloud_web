"""API 层共享依赖：文件校验、编码嗅探。"""
from __future__ import annotations

from fastapi import UploadFile

from ..config import settings
from ..errors import BizError


async def validate_text_file(file: UploadFile) -> bytes:
    """校验文本文件：扩展名 + 大小。返回内容 bytes。"""
    if not file.filename or not file.filename.lower().endswith(".txt"):
        raise BizError(400, "仅支持 .txt 文件", "INVALID_FILE_TYPE")
    content = await file.read()
    if len(content) > settings.max_text_file_bytes:
        raise BizError(
            413,
            f"文件超过 {settings.max_text_file_bytes // 1024 // 1024}MB 限制",
            "FILE_TOO_LARGE",
        )
    return content


async def validate_mask_image(file: UploadFile) -> bytes:
    """校验遮罩图：扩展名 + 大小。"""
    if not file.filename or not file.filename.lower().endswith((".png", ".jpg", ".jpeg")):
        raise BizError(400, "遮罩图仅支持 PNG/JPG", "INVALID_FILE_TYPE")
    content = await file.read()
    if len(content) > settings.max_mask_image_bytes:
        raise BizError(
            413,
            f"遮罩图超过 {settings.max_mask_image_bytes // 1024 // 1024}MB 限制",
            "FILE_TOO_LARGE",
        )
    return content


def decode_text_bytes(raw: bytes) -> str:
    """编码嗅探：UTF-8 → chardet → GBK。"""
    try:
        return raw.decode("utf-8")
    except UnicodeDecodeError:
        import chardet

        encoding = chardet.detect(raw)["encoding"] or "gbk"
        return raw.decode(encoding, errors="replace")
