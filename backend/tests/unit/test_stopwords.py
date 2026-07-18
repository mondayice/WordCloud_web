"""停用词加载测试。"""
from __future__ import annotations

from pathlib import Path

from app.config import settings
from app.core.tokenizer.stopwords import StopwordSource


def test_stopwords_load_from_builtin() -> None:
    source = StopwordSource(settings.data_dir / "stopwords")
    s = source.as_set()
    # 内置停用词文件加载后应该有数百个词
    assert len(s) > 100


def test_stopwords_contains_case_insensitive() -> None:
    source = StopwordSource(settings.data_dir / "stopwords")
    # 英文停用词大小写不敏感
    assert source.contains("the")
    assert source.contains("THE")


def test_stopwords_merge_extra() -> None:
    source = StopwordSource(settings.data_dir / "stopwords", extra=["自定义词"])
    assert source.contains("自定义词")


def test_stopwords_nonexistent_dir_safe() -> None:
    """目录不存在时不应崩溃。"""
    source = StopwordSource(Path("/nonexistent/path"))
    assert source.as_set() == set() or len(source.as_set()) == 0


def test_stopwords_comment_lines_ignored() -> None:
    """# 开头的行不应进入词集。"""
    source = StopwordSource(settings.data_dir / "stopwords")
    assert not source.contains("#")
