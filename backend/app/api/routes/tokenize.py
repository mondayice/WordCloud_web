"""POST /api/tokenize：分词 + 词频统计。"""
from __future__ import annotations

import tempfile
from collections import Counter
from pathlib import Path

from fastapi import APIRouter, File, Form, Request, UploadFile
from fastapi.concurrency import run_in_threadpool

from ...config import settings
from ...core.tokenizer.jieba_tokenizer import JiebaTokenizer
from ...core.tokenizer.stopwords import StopwordSource
from ...errors import BizError
from ...schemas.tokenize import TokenizeResponse, WordFrequency
from ..dependencies import decode_text_bytes, validate_text_file

router = APIRouter()


@router.post("/tokenize", response_model=TokenizeResponse)
async def tokenize(
    request: Request,
    text: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
    custom_dict: UploadFile | None = File(default=None),
    extra_stopwords: str | None = Form(default=None),
) -> TokenizeResponse:
    """分词 + 词频统计。"""
    # 1. 解析输入源
    if file:
        raw = await validate_text_file(file)
        content = decode_text_bytes(raw)
    elif text:
        content = text
    else:
        raise BizError(400, "必须提供 text 或 file", "MISSING_INPUT")

    # 2. 校验长度
    if len(content) < settings.min_text_chars:
        raise BizError(
            400,
            f"文本不足 {settings.min_text_chars} 字符，无法分词",
            "TEXT_TOO_SHORT",
        )

    # 3. 构建停用词源
    base_stopwords = request.app.state.stopwords
    extra = extra_stopwords.splitlines() if extra_stopwords else []
    if extra:
        stopwords = StopwordSource(settings.data_dir / "stopwords", extra)
    else:
        stopwords = base_stopwords

    # 4. 处理自定义字典（写临时文件供 jieba.load_userdict 使用）
    user_dict_path: Path | None = None
    if custom_dict:
        with tempfile.NamedTemporaryFile(
            mode="wb", suffix=".txt", delete=False
        ) as tmp:
            tmp.write(await custom_dict.read())
            user_dict_path = Path(tmp.name)

    try:
        # 5. 分词（放线程池避免阻塞事件循环）
        tokenizer = JiebaTokenizer(stopwords, user_dict_path)
        counter: Counter = await run_in_threadpool(tokenizer.tokenize, content)
    finally:
        if user_dict_path and user_dict_path.exists():
            user_dict_path.unlink()

    # 6. 构建响应
    frequencies = [WordFrequency(word=w, count=c) for w, c in counter.most_common()]
    return TokenizeResponse(
        frequencies=frequencies,
        total_words=sum(counter.values()),
        unique_words=len(counter),
    )
