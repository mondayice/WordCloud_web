# Changelog

本文件记录 WordCloud Studio 的所有版本变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

待发布内容将在此处累积。

## [0.2.0] - 2026-07-18

第二次发布。聚焦样式表达力、部署便捷性和工程化。

### 新增

#### 配色方案
- **新增预设配色 `dusk`（暮色）**：6 色 RGB 来源 `(37,43,49) (94,102,104) (193,200,199) (246,250,251) (212,156,107) (0,0,0)`，冷灰蓝调 + 一个橙色点缀，莫兰迪风格
- 配色总数从 5 套增至 **6 套**

#### 样式控制
- **旋转角度扩展为 5 档**：`0° / 30° / 45° / 60° / 90°`（原仅 0°/90° 两档）
- **字号自由控制**：新增「字号范围」开关 + 双滑块
  - 关闭时使用 wordcloud 库自动算法（根据画布尺寸自适应）
  - 开启后用 min/max 滑块限制实际渲染字号（min 4–50px / max 50–300px）
  - min/max 互相钳制，防止反转
  - 实测验证：min=20 max=80 → 实际渲染字号 27–80px，严格遵守

#### 部署与运维
- **Docker 支持**：新增 `Dockerfile`（多阶段构建，node 构建前端 → python 运行后端）+ `docker-compose.yml`
  - 镜像大小约 350 MB
  - 资源限制 1 GB 内存 / 2 CPU
  - HEALTHCHECK 走 `/api/health`
  - 字体在构建期自动下载（不依赖主机）
- **一键启动脚本**：`start.bat`（Windows，GBK 编码 + CRLF）+ `start.sh`（macOS/Linux/Git Bash）
  - 自动检查 Python / 依赖 / 字体 / 前端构建
  - 缺失时自动安装或给出修复指引
  - 启动后自动打开浏览器

#### 文档与示例
- **jieba 自定义字典示例文件**：`jieba自定义字典示例.txt`
  - 6 大类共 56 个词条（AI/科技、设计美学、品牌产品、网络热词、人名、地名机构）
  - 完整格式注释（词 [词频] [词性]）
  - 实测验证：加载后"深度学习/机器学习/字节跳动"等被整体识别

### 变更

- **删除「水平排版比例」滑块**：与旋转角度功能重叠（都映射到 wordcloud 的 `prefer_horizontal`），保留两个会让用户困惑
- **旋转角度描述改进**：Chip 文字从 `0°/90°` 改为 `全水平/全垂直`，hover 显示具体水平/垂直百分比
- **后端默认旋转角度** 从 90 改为 0（全水平，更稳妥的默认）
- **修复 wordcloud 库 `max_font_size` 传递 bug**：必须显式传给 `generate_from_frequencies()`，否则被自动算法覆盖（这是库的隐蔽行为，已在 wordcloud_renderer.py 修复）
- **`.gitignore` 加固**：`*.txt` 通配规则（保留 stopwords/presets.json 例外），排除 `docs/` `设计文档.md` `.zcode/` 等内部资料

### 测试

- 后端测试从 65 个增至 **71 个**（+6）：
  - `test_config_includes_dusk_scheme`：dusk 配色端到端
  - `test_rotation_mapping.py`：5 个旋转角度映射单元测试
- 字号控制真实生效验证（直接读 `wc.layout_` 字号范围，断言 min/max 被严格遵守）

### 性能数据（实测）

| 操作 | 耗时 |
|---|---|
| GET /api/health | p50 1.1 ms |
| GET /api/config | p50 0.9 ms |
| POST /api/tokenize（58 KB 中文） | avg 89 ms |
| POST /api/wordcloud（1080p, 200 词） | ~3.7 s |
| POST /api/wordcloud（4K, 200 词） | ~18 s |

资源占用：内存 137 MB（RSS），Docker 镜像约 350 MB。

## [0.1.0] - 2026-07-18

首个公开发布版本。从设计文档到完整落地，覆盖中英文分词、词云生成、可视化预览、多格式导出全流程。

### 新增

#### 输入与分词
- 文本输入面板，Tab 切换"粘贴文本"/"上传文件"两种输入方式
- 一键**粘贴**按钮（读取系统剪贴板，支持 HTTPS / localhost）
- 一键**清除**按钮（空内容时自动禁用）
- 实时字符校验（≥20 字符方可分词）
- 文件上传支持 .txt，UTF-8 / GBK 自动嗅探（chardet）
- jieba 中文分词，内置 2000+ 中英文停用词
- **自定义字典**上传（jieba 用户词典，行业术语 / 专有名词）
- **追加停用词**（每行一个，按需屏蔽无意义词）
- 词频统计 Top-20 条形图预览，可折叠展开

#### 词云生成
- **5 种预设形状**：铺满 / 菱形 / 心形 / 圆形 / 星型（numpy 数学公式代码生成，无外部图片依赖）
- **自定义遮罩**：上传任意 PNG/JPG 作为词云形状（白色绘制 / 黑色留空，自动二值化）
- **5 套预设配色**：暖灰 / 日落 / 海洋 / 森林 / 鲜活
- **自定义配色方案**：2–12 色任意组合，多套保存到 localStorage
- 配色方案 **导入 / 导出** `.wc-colors.json`（key 冲突自动重命名）
- **样式微调**：背景色（支持透明）、水平排版比例（0–100%）、旋转角度（0°/90°）

#### 预览与导出
- **画布缩放**：鼠标滚轮 pin-to-mouse 缩放（0.1× – 5×）
- **画布拖动**：左键拖动平移，cursor 切换 grab / grabbing
- **双击重置** + 左下角浮层控件（`−` / `百分比` / `+` / `↻`）
- 重新生成时自动重置缩放
- **6 种尺寸预设**：1920×1080 / 4K / 2K / 1366×768 / 手机竖屏 / 方形
- **PNG 导出**：PIL optimize，位图
- **SVG 导出**：内嵌字体（`to_svg(embed_image=True)`），矢量无损

#### 界面与体验
- **一屏固定布局**：左侧参数栏 + 右侧画布，整页不滚动
- **可折叠参数栏**：边界圆形把手一键收起，画布占满全屏
- **响应式**：桌面分栏（md 300px / lg 360px）/ 移动端 FAB + 底部抽屉（85vh，Esc 关闭，滚动锁）
- **三态主题**：light / dark / system，跟随系统实时切换
- **FOUC 防闪烁**：`<head>` 内联脚本在 CSS 加载前同步应用主题
- 主题持久化（localStorage key `wc-theme`）
- **WCAG 2.1 AA 无障碍**：键盘导航、`aria-pressed` / `aria-live` / `role=tablist`、focus-visible 焦点环、`prefers-reduced-motion` 动效降级

#### 后端架构
- **FastAPI 单进程**同时 serve API + 前端静态资源（同源无 CORS）
- **领域层纯净**：`core/` 下任何模块都不依赖 fastapi（可独立单测 / 迁移到 Flask / CLI）
- **CPU 隔离**：所有重计算用 `async def` + `run_in_threadpool`，不阻塞事件循环
- **启动预热**：`jieba.initialize()` + 字体校验 + 停用词加载（fail fast）
- **统一错误响应**：`{detail, code}` 格式，10 个业务错误码
- **配色互斥校验**：`color_scheme` 与 `colors` 二选一，后者优先
- **SPA fallback**：非 /api 路径自动返回 index.html

#### 测试
- **65 个测试**全部通过：
  - 单元测试 52 个：text_segmenter / filters / stopwords / presets（5 形状 mask）/ color_funcs（边界 2/12 色）
  - 集成测试 13 个：health / config / tokenize（文本/文件/字典/停用词/短文本）/ wordcloud（5 形状 × PNG/SVG × 配色边界）

### 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18.3 + Vite 5.4 + TypeScript 5.6 + Tailwind CSS 3.4 + Zustand 4.5 + lucide-react 0.441 |
| 后端 | FastAPI 0.115.5 + uvicorn 0.32.1 + jieba 0.42.1 + wordcloud 1.9.3 + Pillow 11.0 + numpy 1.26.4 |
| 字体 | Noto Sans CJK SC（思源黑体，OFL 1.1） |

### 代码规模

- 后端：44 个 Python 文件，~3500 行
- 前端：36 个 TS/TSX 文件，~3300 行
- 测试：65 个用例

### 已知限制

- 字体文件（`NotoSansCJKsc-Regular.otf`，约 16 MB）需用户手动下载，未打包入库
- 词云渲染基于 `wordcloud` 库，旋转角度仅支持 0°/90° 简化模式（通过 `prefer_horizontal` 实现）
- 自定义配色持久化到浏览器 localStorage，跨设备不同步
- 滚轮缩放在非 HTTPS / 非 localhost 环境下，剪贴板 API 可能受限

[Unreleased]: https://github.com/mondayice/WordCloud_web/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/mondayice/WordCloud_web/releases/tag/v0.2.0
[0.1.0]: https://github.com/mondayice/WordCloud_web/releases/tag/v0.1.0
