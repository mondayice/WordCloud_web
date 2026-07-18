"""业务异常 + 统一错误响应。

FastAPI 的 HTTPException 不接受 code 参数，这里定义自定义业务异常
并配 exception_handler，使响应体包含 detail + code 字段。
"""
from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class BizError(Exception):
    """业务错误基类。携带 HTTP 状态码、detail 消息、业务 code。"""

    def __init__(self, status_code: int, detail: str, code: str):
        self.status_code = status_code
        self.detail = detail
        self.code = code
        super().__init__(detail)


def register_error_handlers(app: FastAPI) -> None:
    """注册全局异常处理器，统一错误响应格式为 {detail, code}。"""

    @app.exception_handler(BizError)
    async def biz_error_handler(_request: Request, exc: BizError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail, "code": exc.code},
        )
