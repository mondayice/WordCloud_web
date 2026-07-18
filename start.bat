@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

title WordCloud Studio

REM ============================================================
REM  WordCloud Studio Launcher (Windows)
REM  - Checks Python / dependencies / font / frontend build
REM  - Auto-installs missing pieces
REM  - Starts uvicorn and opens browser
REM ============================================================

cd /d "%~dp0%"

echo.
echo ============================================================
echo   WordCloud Studio Starting...
echo ============================================================
echo.

REM ---- 1. Check Python ----
echo [1/4] Checking Python...
python --version > nul 2>&1
if errorlevel 1 (
    echo.
    echo [ERROR] Python not found. Please install Python 3.10+:
    echo         https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)
for /f "tokens=2" %%v in ('python --version 2^>^&1') do set PYVER=%%v
echo       Python !PYVER!  OK

REM ---- 2. Check Backend Dependencies ----
echo [2/4] Checking backend dependencies...
python -c "import fastapi, uvicorn, jieba, wordcloud, PIL, numpy, chardet, pydantic_settings" > nul 2>&1
if errorlevel 1 (
    echo       Installing dependencies...
    cd backend
    pip install -r requirements.txt
    if errorlevel 1 (
        echo.
        echo [ERROR] Dependency install failed. Run manually:
        echo         cd backend ^&^& pip install -r requirements.txt
        echo.
        pause
        exit /b 1
    )
    cd ..
    echo       Dependencies installed
) else (
    echo       Dependencies OK
)

REM ---- 3. Check Chinese Font ----
echo [3/4] Checking Chinese font...
set "FONT_FILE=backend\app\fonts\NotoSansCJKsc-Regular.otf"
if not exist "%FONT_FILE%" set "FONT_FILE=backend\app\fonts\NotoSansSC-Regular.otf"
if not exist "%FONT_FILE%" (
    echo.
    echo [ERROR] Chinese font missing. Download to backend\app\fonts\:
    echo.
    echo         cd backend\app\fonts
    echo         curl -L -o NotoSansCJKsc-Regular.otf "https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf"
    echo.
    pause
    exit /b 1
)
echo       Font OK

REM ---- 4. Check Frontend Build ----
echo [4/4] Checking frontend build...
if not exist "backend\static\index.html" (
    echo       Building frontend...
    where npm > nul 2>&1
    if errorlevel 1 (
        echo.
        echo [ERROR] npm not found. Install Node.js 18+:
        echo         https://nodejs.org/
        echo.
        pause
        exit /b 1
    )
    cd frontend
    if not exist "node_modules" (
        echo       Installing frontend deps...
        call npm install
    )
    call npm run build
    if errorlevel 1 (
        echo.
        echo [ERROR] Frontend build failed.
        pause
        exit /b 1
    )
    cd ..
    echo       Frontend built
) else (
    echo       Build OK
)

echo.
echo ============================================================
echo   All ready! Starting server...
echo.
echo   URL:       http://127.0.0.1:8000
echo   API Docs:  http://127.0.0.1:8000/docs
echo.
echo   Press Ctrl+C to stop
echo ============================================================
echo.

REM ---- 5. Open browser after 3 seconds ----
start "" cmd /c "timeout /t 3 /nobreak > nul && start http://127.0.0.1:8000"

REM ---- 6. Start uvicorn (foreground, Ctrl+C to exit) ----
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
