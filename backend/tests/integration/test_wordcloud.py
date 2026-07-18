"""POST /api/wordcloud 集成测试。

注意：需要字体文件存在。CI 中应预下载 NotoSansSC-Regular.otf。
"""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.config import settings
from app.main import app

# 跳过条件：字体缺失时跳过本测试文件（兼容两种文件名）
_font_exists = (settings.fonts_dir / "NotoSansCJKsc-Regular.otf").exists() or (
    settings.fonts_dir / "NotoSansSC-Regular.otf"
).exists()
pytestmark = pytest.mark.skipif(
    not _font_exists,
    reason="缺少 NotoSansCJKsc-Regular.otf 字体文件，请参考 backend/app/fonts/README.md 下载",
)

client = TestClient(app)

FREQUENCIES = [
    {"word": "自然语言", "count": 10},
    {"word": "处理", "count": 8},
    {"word": "人工智能", "count": 7},
    {"word": "深度学习", "count": 6},
    {"word": "机器学习", "count": 5},
    {"word": "算法", "count": 4},
    {"word": "数据", "count": 4},
    {"word": "模型", "count": 3},
    {"word": "训练", "count": 3},
    {"word": "预测", "count": 2},
]
FREQ_JSON = __import__("json").dumps(FREQUENCIES)


def test_wordcloud_png_fill_shape_preset_color() -> None:
    """铺满形状 + 预设配色 + PNG 导出。"""
    with client:
        response = client.post(
            "/api/wordcloud",
            data={
                "frequencies": FREQ_JSON,
                "shape": "fill",
                "color_scheme": "sunset",
                "width": 400,
                "height": 300,
                "format": "png",
            },
        )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    assert len(response.content) > 1000


def test_wordcloud_svg_circle_shape_preset_color() -> None:
    """圆形 + 预设配色 + SVG 导出。"""
    with client:
        response = client.post(
            "/api/wordcloud",
            data={
                "frequencies": FREQ_JSON,
                "shape": "circle",
                "color_scheme": "ocean",
                "width": 400,
                "height": 400,
                "format": "svg",
            },
        )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/svg+xml"
    assert b"<svg" in response.content


def test_wordcloud_diamond_heart_star_shapes() -> None:
    """菱形/心形/星型各生成一次。"""
    for shape in ["diamond", "heart", "star"]:
        with client:
            response = client.post(
                "/api/wordcloud",
                data={
                    "frequencies": FREQ_JSON,
                    "shape": shape,
                    "color_scheme": "forest",
                    "width": 400,
                    "height": 400,
                    "format": "png",
                },
            )
        assert response.status_code == 200, f"shape={shape} 失败"


def test_wordcloud_custom_colors_two_boundary() -> None:
    """自定义颜色：2 色下限边界。"""
    with client:
        response = client.post(
            "/api/wordcloud",
            data={
                "frequencies": FREQ_JSON,
                "shape": "fill",
                "colors": '["#000000", "#FFFFFF"]',
                "width": 400,
                "height": 300,
                "format": "png",
            },
        )
    assert response.status_code == 200


def test_wordcloud_custom_colors_twelve_boundary() -> None:
    """自定义颜色：12 色上限边界。"""
    colors = [f"#{i:06X}" for i in range(12)]
    import json as _json

    with client:
        response = client.post(
            "/api/wordcloud",
            data={
                "frequencies": FREQ_JSON,
                "shape": "fill",
                "colors": _json.dumps(colors),
                "width": 400,
                "height": 300,
                "format": "png",
            },
        )
    assert response.status_code == 200


def test_wordcloud_custom_colors_too_few_rejected() -> None:
    """自定义颜色 < 2 应被拒绝。"""
    with client:
        response = client.post(
            "/api/wordcloud",
            data={
                "frequencies": FREQ_JSON,
                "shape": "fill",
                "colors": '["#000000"]',
                "width": 400,
                "height": 300,
                "format": "png",
            },
        )
    assert response.status_code == 400
    assert response.json()["code"] == "INVALID_COLORS"


def test_wordcloud_custom_colors_invalid_hex_rejected() -> None:
    """自定义颜色非法 HEX 应被拒绝。"""
    with client:
        response = client.post(
            "/api/wordcloud",
            data={
                "frequencies": FREQ_JSON,
                "shape": "fill",
                "colors": '["#GGGGGG", "#1C1917"]',
                "width": 400,
                "height": 300,
                "format": "png",
            },
        )
    assert response.status_code == 400
    assert response.json()["code"] == "INVALID_COLORS"


def test_wordcloud_colors_priority_over_scheme() -> None:
    """color_scheme 与 colors 同时传时优先 colors。"""
    with client:
        response = client.post(
            "/api/wordcloud",
            data={
                "frequencies": FREQ_JSON,
                "shape": "fill",
                "color_scheme": "sunset",
                "colors": '["#FF0000", "#00FF00"]',
                "width": 400,
                "height": 300,
                "format": "png",
            },
        )
    # colors 优先，应成功（不会因互斥校验失败）
    assert response.status_code == 200


def test_wordcloud_missing_color_rejected() -> None:
    """不传配色参数应被拒绝。"""
    with client:
        response = client.post(
            "/api/wordcloud",
            data={
                "frequencies": FREQ_JSON,
                "shape": "fill",
                "width": 400,
                "height": 300,
                "format": "png",
            },
        )
    assert response.status_code == 400
    assert response.json()["code"] == "MISSING_COLOR"


def test_wordcloud_invalid_format_rejected() -> None:
    """不支持的格式应被拒绝。"""
    with client:
        response = client.post(
            "/api/wordcloud",
            data={
                "frequencies": FREQ_JSON,
                "shape": "fill",
                "color_scheme": "sunset",
                "width": 400,
                "height": 300,
                "format": "gif",
            },
        )
    assert response.status_code == 400
    assert response.json()["code"] == "INVALID_FORMAT"


def test_wordcloud_mask_shape_without_image_rejected() -> None:
    """shape=mask 但未传 mask_image 应被拒绝。"""
    with client:
        response = client.post(
            "/api/wordcloud",
            data={
                "frequencies": FREQ_JSON,
                "shape": "mask",
                "color_scheme": "sunset",
                "width": 400,
                "height": 300,
                "format": "png",
            },
        )
    assert response.status_code == 400
    assert response.json()["code"] == "MISSING_MASK"


def test_wordcloud_text_input_renders() -> None:
    """直接传文本（非 frequencies）走分词路径。"""
    text = "自然语言处理是人工智能的重要分支，" * 5
    with client:
        response = client.post(
            "/api/wordcloud",
            data={
                "text": text,
                "shape": "fill",
                "color_scheme": "sunset",
                "width": 400,
                "height": 300,
                "format": "png",
            },
        )
    assert response.status_code == 200


def test_wordcloud_transparent_background() -> None:
    """透明背景应成功。"""
    with client:
        response = client.post(
            "/api/wordcloud",
            data={
                "frequencies": FREQ_JSON,
                "shape": "fill",
                "color_scheme": "sunset",
                "background_color": "transparent",
                "width": 400,
                "height": 300,
                "format": "png",
            },
        )
    assert response.status_code == 200
