"""GET /api/config 集成测试。"""
from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_config_returns_full_presets() -> None:
    with client:
        response = client.get("/api/config")
    assert response.status_code == 200
    data = response.json()

    # 形状 6 项（5 数学形状 + mask）
    assert len(data["shapes"]) == 6
    shape_keys = {s["key"] for s in data["shapes"]}
    assert shape_keys == {"fill", "diamond", "heart", "circle", "star", "mask"}

    # 配色 6 套预设，全部 builtin=true
    assert len(data["color_schemes"]) == 6
    for cs in data["color_schemes"]:
        assert cs["builtin"] is True
        assert len(cs["colors"]) >= 2

    # 自定义色限制
    assert data["custom_color_limits"] == {"min": 2, "max": 12}

    # 尺寸 6 项
    assert len(data["size_presets"]) == 6


def test_config_includes_vibrant_six_colors() -> None:
    with client:
        response = client.get("/api/config")
    data = response.json()
    vibrant = next(cs for cs in data["color_schemes"] if cs["key"] == "vibrant")
    assert len(vibrant["colors"]) == 6


def test_config_includes_dusk_scheme() -> None:
    """dusk（暮色）预设必须存在，含 6 个 HEX 颜色。"""
    with client:
        response = client.get("/api/config")
    data = response.json()
    dusk = next(cs for cs in data["color_schemes"] if cs["key"] == "dusk")
    assert dusk["label"] == "暮色"
    assert dusk["builtin"] is True
    assert len(dusk["colors"]) == 6
    assert dusk["colors"][0] == "#252B31"  # rgb(37, 43, 49)
    assert dusk["colors"][4] == "#D49C6B"  # rgb(212, 156, 107) 橙色点缀
    assert dusk["colors"][5] == "#000000"  # rgb(0, 0, 0)
