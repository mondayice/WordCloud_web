"""POST /api/wordcloud：生成词云图片（PNG/SVG）。

修复设计文档中的多个接线 bug：
1. 用 Exporter.export() 而非模块级 _png_export/_svg_export 自由函数
2. 支持 custom_dict 自定义字典（原版死参数）
3. 未知 shape 抛 BizError(400) 而非 500
4. 配色参数 color_scheme vs colors 互斥校验
"""
from __future__ import annotations

import json
import tempfile
from collections import Counter
from pathlib import Path

from fastapi import APIRouter, File, Form, Request, Response, UploadFile
from fastapi.concurrency import run_in_threadpool

from ...config import settings
from ...core.exporter.png_exporter import PngExporter
from ...core.exporter.svg_exporter import SvgExporter
from ...core.layout.mask_from_image import build_mask_from_image
from ...core.layout.presets import SHAPE_BUILDERS, build_preset_mask
from ...core.renderer.color_funcs import resolve_colors
from ...core.renderer.interfaces import RenderResult
from ...core.renderer.wordcloud_renderer import WordCloudRenderer
from ...core.tokenizer.jieba_tokenizer import JiebaTokenizer
from ...core.tokenizer.stopwords import StopwordSource
from ...errors import BizError
from ...schemas.tokenize import WordFrequency
from ..dependencies import decode_text_bytes, validate_mask_image, validate_text_file

router = APIRouter()

_exporters = {
    "png": PngExporter(),
    "svg": SvgExporter(),
}


def _do_render(
    frequencies: Counter,
    width: int,
    height: int,
    shape: str,
    mask_image_bytes: bytes | None,
    colors: list[str],
    background_color: str,
    prefer_horizontal: float,
    min_font_size: int,
    max_font_size: int | None,
    rotation_steps: int,
    fonts,
) -> RenderResult:
    """同步函数，由 run_in_threadpool 调用。"""
    # 1. 构建 mask
    if shape == "fill":
        mask = None
    elif shape == "mask":
        if not mask_image_bytes:
            raise BizError(400, "shape=mask 但未提供 mask_image", "MISSING_MASK")
        mask = build_mask_from_image(mask_image_bytes, width, height)
    elif shape in SHAPE_BUILDERS:
        mask = build_preset_mask(shape, width, height)
    else:
        raise BizError(400, f"不支持的形状：{shape}", "INVALID_SHAPE")

    # 2. 渲染
    renderer = WordCloudRenderer(fonts)
    return renderer.render(
        frequencies=frequencies,
        width=width,
        height=height,
        mask=mask,
        colors=colors,
        background=background_color,
        prefer_horizontal=prefer_horizontal,
        min_font_size=min_font_size,
        max_font_size=max_font_size,
        rotation_steps=rotation_steps,
    )


@router.post("/wordcloud")
async def generate_wordcloud(
    request: Request,
    format: str = Form(...),
    shape: str = Form(...),
    # 配色源（二选一）：预设 key 或自定义颜色数组
    color_scheme: str | None = Form(default=None),
    colors: str | None = Form(default=None),
    width: int = Form(default=1920),
    height: int = Form(default=1080),
    background_color: str = Form(default="#FAFAF9"),
    prefer_horizontal: float = Form(default=0.9),
    min_font_size: int = Form(default=8),
    max_font_size: int | None = Form(default=None),
    rotation_steps: int = Form(default=0),
    # 文本源（三选一）
    frequencies: str | None = Form(default=None),
    text: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
    custom_dict: UploadFile | None = File(default=None),
    extra_stopwords: str | None = Form(default=None),
    # 遮罩图
    mask_image: UploadFile | None = File(default=None),
) -> Response:
    """生成词云图片。"""
    # 1. 校验参数
    if format not in _exporters:
        raise BizError(400, f"不支持的格式：{format}", "INVALID_FORMAT")
    if not color_scheme and not colors:
        raise BizError(400, "必须提供 color_scheme 或 colors", "MISSING_COLOR")
    if shape == "mask" and not mask_image:
        raise BizError(400, "shape=mask 需提供 mask_image", "MISSING_MASK")

    # 2. 解析配色（预设或自定义，统一为 HEX 列表）
    custom_colors = json.loads(colors) if colors else None
    try:
        resolved_colors = resolve_colors(scheme_key=color_scheme, colors=custom_colors)
    except ValueError as e:
        raise BizError(400, str(e), "INVALID_COLORS") from e

    # 3. 解析词频（优先 frequencies，否则分词）
    if frequencies:
        freq_list = [WordFrequency(**item) for item in json.loads(frequencies)]
        counter = Counter({f.word: f.count for f in freq_list})
    elif text or file:
        if file:
            raw = await validate_text_file(file)
            content = decode_text_bytes(raw)
        else:
            content = text or ""
        if len(content) < settings.min_text_chars:
            raise BizError(
                400,
                f"文本不足 {settings.min_text_chars} 字符",
                "TEXT_TOO_SHORT",
            )

        # 处理自定义字典（与 tokenize 路由一致）
        user_dict_path: Path | None = None
        if custom_dict:
            with tempfile.NamedTemporaryFile(
                mode="wb", suffix=".txt", delete=False
            ) as tmp:
                tmp.write(await custom_dict.read())
                user_dict_path = Path(tmp.name)
        try:
            stopwords = request.app.state.stopwords
            if extra_stopwords:
                extra = extra_stopwords.splitlines()
                stopwords = StopwordSource(settings.data_dir / "stopwords", extra)
            tokenizer = JiebaTokenizer(stopwords, user_dict_path)
            counter = await run_in_threadpool(tokenizer.tokenize, content)
        finally:
            if user_dict_path and user_dict_path.exists():
                user_dict_path.unlink()
    else:
        raise BizError(400, "必须提供 frequencies、text 或 file", "MISSING_INPUT")

    if not counter:
        raise BizError(400, "分词结果为空，请检查文本或停用词", "EMPTY_FREQUENCIES")

    # 4. 处理遮罩图
    mask_bytes = None
    if shape == "mask" and mask_image:
        mask_bytes = await validate_mask_image(mask_image)

    # 5. 渲染 + 导出（放线程池避免阻塞事件循环）
    fonts = request.app.state.fonts
    render_result = await run_in_threadpool(
        _do_render,
        counter,
        width,
        height,
        shape,
        mask_bytes,
        resolved_colors,
        background_color,
        prefer_horizontal,
        min_font_size,
        max_font_size,
        rotation_steps,
        fonts,
    )

    exporter = _exporters[format]
    image_bytes = await run_in_threadpool(exporter.export, render_result)

    return Response(
        content=image_bytes,
        media_type=exporter.mimetype,
        headers={"Content-Disposition": "inline"},
    )
