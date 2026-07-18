# WordCloud Studio

> 一站式中英文词云生成器：粘贴文本 / 上传文件 → 分词词频统计 → 可视化预览 → PNG / SVG 下载。  
> 单机本地部署，零依赖云服务，浏览器即开即用。

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/tests-65%20passed-brightgreen.svg)](#-测试)

---

## ✨ 功能特性

### 文本输入
- **Tab 切换输入方式**：粘贴文本 / 上传文件（.txt，UTF-8/GBK 自动识别）
- **一键粘贴 / 清除**：从系统剪贴板读取，按钮显示新增字符数
- **实时字符校验**：≥20 字符方可分词，边输入边提示

### 分词与词频
- **jieba 中文分词**：内置 2000+ 中英文停用词，启动预热避免首次卡顿
- **自定义字典**：上传 jieba 用户词典（行业术语、专有名词）
- **追加停用词**：每行一个，按需屏蔽无意义词
- **词频统计**：Top-20 条形图预览，可折叠

### 词云生成
- **5 种预设形状**：铺满 / 菱形 / 心形 / 圆形 / 星型（numpy 数学公式代码生成，无外部图片依赖）
- **自定义遮罩**：上传任意 PNG/JPG 作为词云形状（白色绘制、黑色留空）
- **预设配色 5 套**：暖灰 / 日落 / 海洋 / 森林 / 鲜活
- **自定义配色方案**：2–12 色任意组合，多套保存到 localStorage，支持 `.wc-colors.json` 导入/导出
- **样式微调**：背景色（支持透明）、水平排版比例、旋转角度（0°/90°）

### 预览与导出
- **画布交互**：滚轮缩放（pin-to-mouse，0.1–5×）、左键拖动平移、双击重置、左下角 `−` / `百分比` / `+` / `↻` 浮层控件
- **6 种尺寸预设**：1920×1080 / 4K / 2K / 1366×768 / 手机竖屏 / 方形
- **双格式导出**：PNG（位图，optimize）/ SVG（矢量，内嵌字体，无损缩放）

### 界面体验
- **一屏固定布局**：左侧参数栏 + 右侧画布，整页不滚动，sidebar 内部独立滚动
- **可折叠参数栏**：边界圆形把手一键收起，画布占满全屏
- **响应式**：桌面分栏（md 300px / lg 360px）/ 平板（< 1024）/ 移动端 FAB + 底部抽屉
- **三态主题**：light / dark / system，FOUC 防闪烁，跟随系统实时切换
- **无障碍**：WCAG 2.1 AA——键盘导航、`aria-pressed`、`aria-live` Toast、动效敏感自动降级

---

## 🏗 技术栈

| 层 | 技术 | 版本 |
|---|---|---|
| 前端框架 | React + Vite + TypeScript | 18.3 / 5.4 / 5.6 |
| 样式 | Tailwind CSS（显式 config + CSS 变量） | 3.4 |
| 状态 | Zustand + persist middleware | 4.5 |
| 图标 | lucide-react | 0.441 |
| 工具 | clsx + tailwind-merge | 2.1 / 2.5 |
| 后端 | FastAPI + uvicorn[standard] | 0.115 / 0.32 |
| 分词 | jieba | 0.42 |
| 词云 | wordcloud + Pillow + numpy | 1.9.3 / 11.0 / **1.26.4**（不用 2.x） |
| 配置 | pydantic + pydantic-settings | 2.9 / 2.6 |
| 编码嗅探 | chardet | 5.2 |
| 字体 | Noto Sans CJK SC（思源黑体） | OFL 1.1 |

---

## 📁 项目结构

```
WordCloud_web/
├── backend/                                # 后端（FastAPI 单进程）
│   ├── app/
│   │   ├── main.py                         # 应用入口（API + 静态资源 + SPA fallback）
│   │   ├── lifespan.py                     # 启动预热（jieba + 字体校验 + 停用词）
│   │   ├── config.py                       # pydantic-settings（WC_ 前缀环境变量）
│   │   ├── errors.py                       # BizError + 全局异常处理器（统一 {detail, code}）
│   │   ├── api/
│   │   │   ├── router.py                   # /api 路由汇总
│   │   │   ├── dependencies.py             # 文件校验 + 编码嗅探（UTF-8→chardet→GBK）
│   │   │   └── routes/
│   │   │       ├── config.py               # GET  /api/config
│   │   │       ├── tokenize.py             # POST /api/tokenize
│   │   │       ├── wordcloud.py            # POST /api/wordcloud
│   │   │       └── health.py               # GET  /api/health
│   │   ├── schemas/                        # Pydantic 模型（API 边界层）
│   │   │   ├── common.py                   # ConfigResponse / 预设模型
│   │   │   ├── tokenize.py                 # TokenizeResponse / WordFrequency
│   │   │   └── wordcloud.py                # ShapeEnum / ExportFormat
│   │   ├── core/                           # 领域层（铁律：不依赖 fastapi）
│   │   │   ├── tokenizer/                  # 分词管线
│   │   │   │   ├── interfaces.py           # Tokenizer / StopwordSourceProtocol
│   │   │   │   ├── text_segmenter.py       # 中英文混合分段
│   │   │   │   ├── filters.py              # 小写化 + 单字过滤
│   │   │   │   ├── stopwords.py            # 内置 + 用户自定义合并
│   │   │   │   └── jieba_tokenizer.py      # jieba 封装
│   │   │   ├── layout/                     # 形状 mask
│   │   │   │   ├── presets.py              # 5 预设（circle/diamond/heart/star/fill）
│   │   │   │   ├── mask_from_image.py      # 用户图二值化
│   │   │   │   └── canvas.py               # 宽高比 clamp
│   │   │   ├── renderer/                   # 渲染
│   │   │   │   ├── color_funcs.py          # 配色（5 预设 + validate + resolve + build_color_func）
│   │   │   │   ├── wordcloud_renderer.py   # wordcloud 库封装
│   │   │   │   └── interfaces.py           # Renderer Protocol + RenderResult
│   │   │   └── exporter/                   # 导出
│   │   │       ├── png_exporter.py         # PIL PNG（optimize）
│   │   │       ├── svg_exporter.py         # to_svg(embed_image=True)
│   │   │       └── interfaces.py           # Exporter Protocol
│   │   ├── fonts/
│   │   │   ├── registry.py                 # FontRegistry（启动校验）
│   │   │   ├── README.md                   # 字体下载说明
│   │   │   └── NotoSansCJKsc-Regular.otf   # 字体文件（.gitignore，需手动下载）
│   │   └── data/
│   │       ├── presets.json                # 5 形状 + 5 配色 + 6 尺寸 + 自定义色限制
│   │       └── stopwords/
│   │           ├── en.txt                  # ~150 英文停用词
│   │           └── zh.txt                  # ~700 中文停用词
│   ├── tests/                              # 65 个测试（单测 + 集成）
│   │   ├── unit/                           # text_segmenter / filters / presets / color_funcs / stopwords
│   │   └── integration/                    # health / config / tokenize / wordcloud
│   ├── static/                             # 前端 build 产物（.gitignore，由 vite 生成）
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── pytest.ini
│   └── .env.example
├── frontend/                               # 前端（React + Vite）
│   ├── src/
│   │   ├── main.tsx                        # React 入口 + ErrorBoundary 包裹
│   │   ├── App.tsx                         # 应用组装（Header + Sidebar + Canvas）
│   │   ├── components/
│   │   │   ├── ErrorBoundary.tsx           # 全局错误边界（localStorage 日志）
│   │   │   ├── ui/                         # 14 个原子组件（barrel index.ts）
│   │   │   │   ├── Button.tsx              # 4 变体 × 4 尺寸 + isLoading
│   │   │   │   ├── Chip.tsx                # aria-pressed + 字重加粗
│   │   │   │   ├── Field.tsx               # label uppercase tracking
│   │   │   │   ├── TextInput.tsx           # focus ring + leftIcon
│   │   │   │   ├── Select.tsx              # 原生 select 封装
│   │   │   │   ├── Slider.tsx              # range + 数值显示
│   │   │   │   ├── ColorInput.tsx          # color picker + HEX 输入 + 透明
│   │   │   │   ├── FileDrop.tsx            # 拖拽 + 点击上传 + 校验
│   │   │   │   ├── Spinner.tsx             # lucide Loader2
│   │   │   │   ├── Toast.tsx               # 4 变体 + 自动消失 + aria-live
│   │   │   │   ├── ThemeToggle.tsx         # Sun/Moon/Monitor 三态
│   │   │   │   ├── Drawer.tsx              # 移动端抽屉（85vh + Esc + 滚动锁）
│   │   │   │   ├── CanvasArea.tsx          # empty/loading/ready/error 四态
│   │   │   │   └── ExportBar.tsx           # 右下浮层导出（格式 × 尺寸矩阵）
│   │   │   ├── layout/
│   │   │   │   └── AppShell.tsx            # 一屏布局 + 可折叠 sidebar + 边界把手
│   │   │   ├── sidebar/                    # 7 个业务面板
│   │   │   │   ├── InputSection.tsx        # Tab 切换（文本/文件）+ 粘贴/清除按钮
│   │   │   │   ├── ShapeSection.tsx        # 5 形状 + 自定义遮罩
│   │   │   │   ├── StyleSection.tsx        # 背景色 + 水平比例 + 旋转
│   │   │   │   ├── ColorSchemeManager.tsx  # 预设 + 自定义配色（导入/导出/编辑）
│   │   │   │   ├── SizeSection.tsx         # 6 尺寸预设
│   │   │   │   ├── StopwordsSection.tsx    # 自定义字典 + 追加停用词
│   │   │   │   └── FrequencyPanel.tsx      # 分析词频 + Top-20 条形图
│   │   │   └── canvas/
│   │   │       └── WordCloudCanvas.tsx     # 预览 + 缩放/拖动/双击重置 + 浮层控件
│   │   ├── store/useAppStore.ts            # Zustand（持久化 theme + customColorSchemes）
│   │   ├── hooks/useTheme.ts               # 三态主题 + matchMedia 实时监听
│   │   ├── lib/
│   │   │   ├── cn.ts                       # clsx + tailwind-merge
│   │   │   ├── theme.ts                    # 主题纯函数（resolveTheme/applyTheme/nextTheme）
│   │   │   ├── api.ts                      # fetch 封装 + 配色导入/导出 + downloadBlob
│   │   │   └── errorHandler.ts             # localStorage 错误日志
│   │   ├── types/api.ts                    # TypeScript 类型定义
│   │   └── styles/globals.css              # Tailwind + CSS 变量（浅/深镜像）
│   ├── index.html                          # 含 FOUC 防闪烁内联脚本
│   ├── vite.config.ts                      # @ 别名 + /api 代理 + outDir → backend/static
│   ├── tailwind.config.ts                  # 显式 content + darkMode:class + 设计 token
│   ├── tsconfig.json                       # strict + noEmit（仅类型检查）
│   ├── postcss.config.js
│   └── package.json
├── docs/                                   # 设计文档（已 gitignore，不入库）
│   ├── 01-技术方案总览.md
│   ├── 02-后端详细设计.md
│   ├── 03-前端详细设计.md
│   └── 04-实施进度.md
├── 设计文档.md                             # 原始需求文档（已 gitignore）
├── README.md
└── .gitignore
```

**代码规模**：后端 44 个 Python 文件 / ~3500 行，前端 36 个 TS/TSX 文件 / ~3300 行，测试 65 个用例。

---

## 🚀 快速开始

### 1. 环境要求

- **Python** 3.10+（推荐 3.12）
- **Node.js** 18+（推荐 20 LTS）
- **npm** 9+

### 2. 后端依赖安装

```bash
cd backend
pip install -r requirements.txt
```

### 3. 下载中文字体（必需）

应用启动时会校验字体存在，缺失则启动失败。

```bash
cd backend/app/fonts

# 方式 A：curl（推荐，跨平台）
curl -L -o NotoSansCJKsc-Regular.otf \
  "https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf"

# 方式 B：PowerShell（Windows）
Invoke-WebRequest -Uri "https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf" -OutFile "NotoSansCJKsc-Regular.otf"
```

> 详见 [`backend/app/fonts/README.md`](./backend/app/fonts/README.md)。字体约 16 MB，OFL 1.1 开源许可。

### 4. 前端依赖与构建

```bash
cd frontend
npm install
npm run build       # 产物输出到 ../backend/static/
```

### 5. 启动应用

```bash
cd backend
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

浏览器访问 **http://127.0.0.1:8000** 即可使用完整应用。

---

## 🛠 开发模式（前后端热重载）

两个终端并行：

```bash
# 终端 1：后端（uvicorn --reload 自动重启）
cd backend
uvicorn app.main:app --reload --port 8000

# 终端 2：前端（Vite HMR，/api 自动代理到 8000）
cd frontend
npm run dev          # 访问 http://localhost:5173
```

开发模式下前端走 Vite DevServer（5173 端口），所有 `/api/*` 请求被 `vite.config.ts` 中的 proxy 转发到后端 8000 端口，**无需配置 CORS**。

---

## 🧪 测试

```bash
cd backend
pip install -r requirements-dev.txt
pytest tests/ -v
```

**当前状态**：65 个测试全部通过（52 单元测试 + 13 集成测试）。

| 测试文件 | 覆盖范围 |
|---|---|
| `test_text_segmenter.py` | 中英文混合分段 |
| `test_filters.py` | 小写化、单字过滤 |
| `test_stopwords.py` | 加载、大小写、合并、注释行 |
| `test_presets.py` | 5 形状 mask（dtype / 中心白 / 角落黑 / 未知 shape 报错） |
| `test_color_funcs.py` | validate / resolve / build_color_func / 边界（2/12 色） |
| `test_health.py` | GET /api/health |
| `test_config.py` | GET /api/config 完整预设 |
| `test_tokenize.py` | 文本/文件/字典/停用词/短文本/缺输入 |
| `test_wordcloud.py` | 5 形状 × PNG/SVG × 预设/自定义色 × 边界校验 |

---

## 📡 API 参考

启动后访问 **http://127.0.0.1:8000/docs** 查看完整 Swagger UI。

| 方法 | 路径 | Content-Type | 用途 |
|---|---|---|---|
| GET | `/api/health` | application/json | 健康检查 |
| GET | `/api/config` | application/json | 预设清单（形状/配色/尺寸） |
| POST | `/api/tokenize` | multipart/form-data | 分词 + 词频统计 |
| POST | `/api/wordcloud` | multipart/form-data | 生成词云（返回 image/png 或 image/svg+xml） |
| GET | `/*` | text/html | SPA fallback 到 index.html |

### 错误响应统一格式

```json
{
  "detail": "文本不足 20 字符，无法分词",
  "code": "TEXT_TOO_SHORT"
}
```

业务错误码：`MISSING_INPUT` / `TEXT_TOO_SHORT` / `INVALID_FILE_TYPE` / `FILE_TOO_LARGE` / `MISSING_COLOR` / `INVALID_COLORS` / `INVALID_FORMAT` / `INVALID_SHAPE` / `MISSING_MASK` / `EMPTY_FREQUENCIES`。

### 配色参数（互斥二选一）

POST `/api/wordcloud` 的配色参数支持两种来源：

| 参数 | 类型 | 说明 |
|---|---|---|
| `color_scheme` | string | 预设配色 key（如 `sunset`、`ocean`） |
| `colors` | string (JSON) | 自定义颜色数组（如 `["#EA580C", "#1C1917"]`，长度 2–12） |

同时传时 **`colors` 优先**；都不传返回 400 `MISSING_COLOR`。

---

## 🎨 自定义配色方案

### 创建
1. 左侧"样式 → 配色方案"区块，点击右上角 **+**
2. 输入名称，选择 2–12 个颜色（每色可拾色器选 + HEX 输入）
3. 点击"保存"

### 持久化
- 自动保存到浏览器 localStorage（key: `wc-app`）
- 刷新 / 关闭浏览器不丢失
- 自定义配色与系统主题一同持久化

### 导入 / 导出
- **导出**：点击工具栏 **↓** → 下载 `wordcloud-colors-YYYY-MM-DD.json`
- **导入**：点击工具栏 **↑** → 选择 `.json` 文件
- 文件格式：

```json
{
  "format": "wordcloud-studio-colors",
  "version": 1,
  "schemes": [
    {
      "key": "custom-...",
      "label": "我的暖调",
      "colors": ["#EA580C", "#1C1917", "#FAFAF9"],
      "builtin": false
    }
  ]
}
```

- 导入时 key 冲突会自动重命名，不覆盖现有方案

---

## 🖼 画布交互

| 操作 | 效果 |
|---|---|
| 鼠标在画布上**滚轮** | 以鼠标位置为锚点缩放（pin-to-mouse），0.1× – 5× |
| **左键拖动** | 平移画布，cursor 切换 `grab` ↔ `grabbing` |
| **双击画布** | 重置到 100% |
| 左下角 **−** / **+** 按钮 | 以中心为锚点缩放（×1.2 步长） |
| 左下角 **百分比** / **↻** 按钮 | 重置缩放 |
| 重新生成词云 | 自动重置缩放 |

> 滚轮缩放仅在画布容器内生效——鼠标在左侧参数栏上时，滚轮正常滚动参数面板。

---

## ⚙️ 配置

后端配置通过环境变量（前缀 `WC_`）或 `.env` 文件覆盖：

```bash
cp backend/.env.example backend/.env
```

| 变量 | 默认值 | 说明 |
|---|---|---|
| `WC_HOST` | `127.0.0.1` | 监听地址（本地单机工具，仅绑 loopback） |
| `WC_PORT` | `8000` | 监听端口 |
| `WC_MIN_TEXT_CHARS` | `20` | 文本最短字符数 |
| `WC_MAX_TEXT_FILE_BYTES` | `5242880` | 文本文件大小上限（5 MB） |
| `WC_MAX_MASK_IMAGE_BYTES` | `10485760` | 遮罩图大小上限（10 MB） |

---

## 🏛 架构设计要点

### 分层依赖
```
api/routes  →  schemas  →  core（领域）
                  ↑
       core 不依赖 api/schemas（领域层纯净）
       core 不依赖 fastapi（可用任意框架复用）
```

**铁律**：`core/` 下任何 `.py` 都不得 `import fastapi`。保证领域逻辑可独立单元测试，未来迁移到 Flask / CLI 工具零修改。

### 部署形态
- **单进程** FastAPI 同时 serve API + 前端静态资源
- **同源**：前后端共用一个 origin，无需 CORS
- **本地单机**：仅绑 127.0.0.1，不暴露公网

### 关键技术决策
| 决策 | 选择 | 原因 |
|---|---|---|
| API 粒度 | 拆分 `/tokenize` + `/wordcloud` 两个端点 | 复用 frequencies 多次渲染（换形状/配色不用重分词） |
| CPU 隔离 | `async def` + `run_in_threadpool` | 不阻塞事件循环，无需 Celery |
| numpy 锁版本 | `numpy==1.26.4` | 不用 2.x，避免 jieba/wordcloud 的 ABI 风险 |
| 主题持久化 | 双 key（`wc-theme` for FOUC + `wc-app` for store） | FOUC 脚本需在 React 加载前同步读取 |
| 配色持久化 | 仅持久化 `customColorSchemes`，不持久化 `selectedColor` | 避免刷新后引用已删除的自定义配色 |
| zoom state | 组件 local，不进 store | 临时交互态，刷新/重生成重置 |
| TS 编译 | `tsconfig: noEmit` + Vite 打包 | 严格类型检查，产物交给 Vite 不污染 src |

完整设计文档（4 份，~6700 行）保留在本地 `docs/` 目录，未入库。

---

## 📄 许可

- 代码：MIT
- 字体 [Noto Sans CJK](https://github.com/notofonts/noto-cjk)：[SIL OFL 1.1](https://scripts.sil.org/OFL)
- 依赖库遵循各自许可证

---

## 📝 实施记录

本项目从设计文档到完整落地，经历 6 个阶段：

| 阶段 | 内容 | 状态 |
|---|---|---|
| 阶段 0 | 项目初始化（目录树 + 依赖 + 配置 + 数据文件） | ✅ |
| 阶段 1 | 后端核心层（tokenizer / layout / renderer / exporter / fonts） | ✅ |
| 阶段 2 | 后端 API 层（schemas / routes / main / lifespan / errors / tests） | ✅ |
| 阶段 3 | 前端基础架构（样式 / store / theme / api / lib / hooks / types） | ✅ |
| 阶段 4 | 前端 UI 原子组件（14 个） | ✅ |
| 阶段 5 | 前端业务组件（sidebar / canvas / App / ErrorBoundary） | ✅ |
| 阶段 6 | 端到端验证（65 测试通过 + 前端构建成功 + API 联调） | ✅ |
| 增强 1 | 整页布局 + 可折叠 sidebar + 画布缩放/拖动 | ✅ |
| 增强 2 | InputSection Tab 切换 + 粘贴/清除按钮 | ✅ |

详细进度见本地 `docs/04-实施进度.md`（未入库）。
