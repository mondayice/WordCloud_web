"""过滤器单元测试。"""
from __future__ import annotations

from app.core.tokenizer.filters import is_too_short, normalize


def test_normalize_lowercase() -> None:
    assert normalize("Hello") == "hello"


def test_normalize_strip() -> None:
    assert normalize("  hello  ") == "hello"


def test_normalize_chinese_unchanged() -> None:
    assert normalize("你好") == "你好"


def test_is_too_short_single_char() -> None:
    assert is_too_short("的") is True
    assert is_too_short("a") is True
    assert is_too_short("I") is True


def test_is_too_short_two_chars() -> None:
    assert is_too_short("hello") is False
    assert is_too_short("我们") is False
