"""文本分段器单元测试。"""
from __future__ import annotations

from app.core.tokenizer.text_segmenter import segment_cjk_latin


def test_pure_chinese() -> None:
    assert segment_cjk_latin("我爱编程") == ["我爱编程"]


def test_pure_english() -> None:
    assert segment_cjk_latin("hello world") == ["hello", "world"]


def test_mixed_cjk_latin() -> None:
    """中英文混合分段。"""
    result = segment_cjk_latin("AI 让世界更好 world")
    assert "让世界更好" in result
    assert any("AI" in r for r in result)
    assert any("world" in r for r in result)


def test_empty_string() -> None:
    assert segment_cjk_latin("") == []


def test_whitespace_only() -> None:
    assert segment_cjk_latin("   ") == []
