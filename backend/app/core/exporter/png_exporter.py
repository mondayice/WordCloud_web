"""PNG 导出：PIL Image → PNG bytes。"""
from __future__ import annotations

from io import BytesIO

from PIL import Image

from ..renderer.interfaces import RenderResult
from .interfaces import Exporter


class PngExporter(Exporter):
    mimetype = "image/png"
    file_extension = "png"

    def export(self, render_result: RenderResult) -> bytes:
        img = Image.fromarray(render_result.to_array())
        buf = BytesIO()
        img.save(buf, format="PNG", optimize=True)
        return buf.getvalue()
