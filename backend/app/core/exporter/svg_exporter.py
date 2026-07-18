"""SVG 导出：wordcloud 的 to_svg(embed_image=True) 内嵌字体。"""
from __future__ import annotations

from ..renderer.interfaces import RenderResult
from .interfaces import Exporter


class SvgExporter(Exporter):
    mimetype = "image/svg+xml"
    file_extension = "svg"

    def export(self, render_result: RenderResult) -> bytes:
        # wordcloud 的 to_svg(embed_image=True) 已嵌入字体
        svg_str = render_result.to_svg()
        return svg_str.encode("utf-8")
