"""POST /api/tokenize 集成测试。"""
from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_tokenize_text_input() -> None:
    """文本输入分词。"""
    text = "自然语言处理是人工智能的重要分支，处理文本数据需要分词技术。"
    with client:
        response = client.post(
            "/api/tokenize",
            data={"text": text},
        )
    assert response.status_code == 200
    data = response.json()
    assert "frequencies" in data
    assert data["total_words"] > 0
    assert data["unique_words"] > 0
    # 词频应按降序排列
    counts = [f["count"] for f in data["frequencies"]]
    assert counts == sorted(counts, reverse=True)


def test_tokenize_short_text_rejected() -> None:
    """短文本应被拒绝。"""
    with client:
        response = client.post(
            "/api/tokenize",
            data={"text": "短文本"},
        )
    assert response.status_code == 400
    data = response.json()
    assert data["code"] == "TEXT_TOO_SHORT"


def test_tokenize_missing_input() -> None:
    """无输入应报错。"""
    with client:
        response = client.post("/api/tokenize", data={})
    assert response.status_code == 400
    assert response.json()["code"] == "MISSING_INPUT"


def test_tokenize_file_upload_utf8(tmp_path) -> None:
    """文件上传（UTF-8）。"""
    p = tmp_path / "test.txt"
    p.write_text("自然语言处理是人工智能的重要分支" * 5, encoding="utf-8")
    with client:
        with p.open("rb") as f:
            response = client.post(
                "/api/tokenize",
                files={"file": ("test.txt", f, "text/plain")},
            )
    assert response.status_code == 200
    data = response.json()
    assert data["unique_words"] > 0


def test_tokenize_extra_stopwords_filtered() -> None:
    """追加停用词应被过滤。"""
    text = "苹果香蕉苹果香蕉苹果香蕉葡萄西瓜葡萄西瓜葡萄西瓜苹果香蕉葡萄西瓜"
    with client:
        response = client.post(
            "/api/tokenize",
            data={"text": text, "extra_stopwords": "苹果\n香蕉"},
        )
    assert response.status_code == 200
    data = response.json()
    words = [f["word"] for f in data["frequencies"]]
    # 苹果/香蕉被过滤
    assert "苹果" not in words
    assert "香蕉" not in words
    # 葡萄/西瓜保留
    assert "葡萄" in words
    assert "西瓜" in words


def test_tokenize_custom_dict() -> None:
    """自定义字典生效。"""
    text = "深度学习模型在图像识别领域取得突破进展深度学习深度学习"
    with client:
        response = client.post(
            "/api/tokenize",
            data={"text": text},
            files={
                "custom_dict": (
                    "dict.txt",
                    "深度学习 100 n\n图像识别 100 n\n",
                    "text/plain",
                )
            },
        )
    assert response.status_code == 200
    data = response.json()
    words = [f["word"] for f in data["frequencies"]]
    # 自定义词应作为整体被识别
    assert "深度学习" in words
