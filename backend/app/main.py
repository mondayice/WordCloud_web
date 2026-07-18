"""FastAPI 应用入口。

部署模式：单进程 FastAPI 同时 serve API 和前端静态资源（同源无 CORS）。
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .api.router import api_router
from .config import settings
from .errors import register_error_handlers
from .lifespan import lifespan


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        lifespan=lifespan,
    )

    # 0. 注册全局异常处理器（统一 {detail, code} 响应格式）
    register_error_handlers(app)

    # 1. 注册 API 路由（先于 catch-all 注册，保证 /api 优先匹配）
    app.include_router(api_router)

    # 2. 静态资源（前端 build 产物）
    static_dir = settings.static_dir
    assets_dir = static_dir / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # 3. SPA fallback：非 /api、非静态资源路径返回 index.html
    index_html = static_dir / "index.html"

    @app.get("/{full_path:path}", response_model=None)
    async def spa_fallback(full_path: str):
        # 尝试直接返回静态文件（如 favicon.ico）
        file_path = static_dir / full_path
        if full_path and file_path.is_file():
            return FileResponse(file_path)
        # 否则返回 SPA 入口
        if index_html.exists():
            return FileResponse(index_html)
        return {"detail": "前端未构建，请先运行 npm run build"}

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.app.main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
    )
