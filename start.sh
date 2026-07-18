#!/usr/bin/env bash
# ============================================================
#  WordCloud Studio 一键启动脚本 (跨平台)
#  - 自动检查 Python / 字体 / 前端构建产物
#  - 缺失时给出修复指引
#  - 启动 uvicorn 并自动打开浏览器
# ============================================================

set -e

# 切换到脚本所在目录（兼容符号链接）
cd "$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m'

print_ok()    { echo -e "  ${GREEN}✓ $1${NC}"; }
print_err()   { echo -e "  ${RED}✗ $1${NC}"; }
print_warn()  { echo -e "  ${YELLOW}! $1${NC}"; }

echo ""
echo "============================================================"
echo "  WordCloud Studio 启动中..."
echo "============================================================"
echo ""

# ---- 1. 检查 Python ----
echo "[1/4] 检查 Python..."
if ! command -v python3 >/dev/null 2>&1 && ! command -v python >/dev/null 2>&1; then
    print_err "未找到 Python。请安装 Python 3.10+"
    echo "       https://www.python.org/downloads/"
    exit 1
fi
PYTHON=python
if command -v python3 >/dev/null 2>&1; then PYTHON=python3; fi
PYVER=$($PYTHON --version 2>&1 | awk '{print $2}')
print_ok "Python $PYVER"

# ---- 2. 检查后端依赖 ----
echo "[2/4] 检查后端依赖..."
if ! $PYTHON -c "import fastapi, uvicorn, jieba, wordcloud, PIL, numpy, chardet, pydantic_settings" 2>/dev/null; then
    print_warn "缺失依赖，正在安装..."
    ( cd backend && $PYTHON -m pip install -r requirements.txt ) || {
        print_err "依赖安装失败。请手动执行：cd backend && pip install -r requirements.txt"
        exit 1
    }
    print_ok "依赖安装完成"
else
    print_ok "依赖已安装"
fi

# ---- 3. 检查字体 ----
echo "[3/4] 检查中文字体..."
FONT_FILE=""
for name in NotoSansCJKsc-Regular.otf NotoSansSC-Regular.otf; do
    if [ -f "backend/app/fonts/$name" ]; then
        FONT_FILE="backend/app/fonts/$name"
        break
    fi
done
if [ -z "$FONT_FILE" ]; then
    print_err "中文字体缺失。请下载并放到 backend/app/fonts/ 目录："
    echo ""
    echo "  cd backend/app/fonts"
    echo "  curl -L -o NotoSansCJKsc-Regular.otf \\"
    echo "    \"https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf\""
    echo ""
    echo "  或参考 backend/app/fonts/README.md"
    exit 1
fi
print_ok "字体已就位"

# ---- 4. 检查前端构建 ----
echo "[4/4] 检查前端构建..."
if [ ! -f "backend/static/index.html" ]; then
    print_warn "前端未构建，正在构建..."
    if ! command -v npm >/dev/null 2>&1; then
        print_err "未找到 npm。请安装 Node.js 18+"
        echo "       https://nodejs.org/"
        exit 1
    fi
    cd frontend
    [ -d "node_modules" ] || npm install
    npm run build || { print_err "前端构建失败"; exit 1; }
    cd ..
    print_ok "前端构建完成"
else
    print_ok "构建产物已存在"
fi

echo ""
echo "============================================================"
echo "  全部就绪！启动服务..."
echo ""
echo "  访问地址: http://127.0.0.1:8000"
echo "  API 文档: http://127.0.0.1:8000/docs"
echo ""
echo "  按 Ctrl+C 停止服务"
echo "============================================================"
echo ""

# ---- 5. 延迟打开浏览器 ----
open_browser() {
    sleep 2
    if command -v cmd.exe >/dev/null 2>&1; then
        cmd.exe /c "start http://127.0.0.1:8000" >/dev/null 2>&1 || true
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open http://127.0.0.1:8000 >/dev/null 2>&1 || true
    elif command -v open >/dev/null 2>&1; then
        open http://127.0.0.1:8000 >/dev/null 2>&1 || true
    fi
}
open_browser &

# ---- 6. 启动 uvicorn ----
cd backend
exec $PYTHON -m uvicorn app.main:app --host 127.0.0.1 --port 8000
