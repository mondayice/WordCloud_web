"""导出层抽象。"""
from __future__ import annotations

from typing import Protocol


class Exporter(Protocol):
    mimetype: str
    file_extension: str

    def export(self, render_result: object) -> bytes: ...
