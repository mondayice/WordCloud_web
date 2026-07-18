# ============================================================
#  WordCloud Studio Dockerfile
#  多阶段构建：node 构建前端 → python 运行后端
#  最终镜像约 350 MB（Python + 依赖 + 字体 + 前端产物）
# ============================================================

# ====== Stage 1: 构建前端 ======
FROM node:20-alpine AS frontend-builder

WORKDIR /build

# 先复制 package 文件，利用 Docker 缓存
COPY frontend/package*.json ./
RUN npm ci --no-audit --no-fund

# 复制源代码并构建
COPY frontend/ ./
# 修改 vite outDir 为容器内路径（避免 ../backend 跨目录）
ENV OUT_DIR=/static
RUN npx vite build --outDir /static --emptyOutDir

# ====== Stage 2: 后端运行时 ======
FROM python:3.12-slim

# 设置时区与编码
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    TZ=Asia/Shanghai \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# 系统依赖（Pillow/wordcloud 需要的运行时库）
RUN apt-get update && apt-get install -y --no-install-recommends \
        libfreetype6 \
        libjpeg62-turbo \
        liblcms2-2 \
        libopenjp2-7 \
        libpng16-16 \
        libtiff6 \
        libwebp7 \
        curl \
        tzdata \
    && rm -rf /var/lib/apt/lists/* \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Python 依赖
COPY backend/requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt

# 复制后端代码
COPY backend/app/ /app/app/

# 下载中文字体（NotoSansCJKsc-Regular.otf，约 16 MB）
# FontRegistry 会优先识别此文件名
RUN curl -fsSL -o /app/app/fonts/NotoSansCJKsc-Regular.otf \
    "https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf" \
    && ls -lh /app/app/fonts/NotoSansCJKsc-Regular.otf

# 复制前端构建产物到 static 目录
COPY --from=frontend-builder /static /app/static

# 复制启动脚本（可选）
COPY backend/pytest.ini /app/pytest.ini

# 暴露端口
EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -sf http://127.0.0.1:8000/api/health || exit 1

# 启动命令
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
