# 字体目录

本目录需手动放置中文字体 `NotoSansCJKsc-Regular.otf`（思源黑体 CJK 简体中文 Regular）。

## 下载命令

### 方式 1：curl（推荐，跨平台）

```bash
curl -L -o NotoSansCJKsc-Regular.otf \
  "https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf"
```

### 方式 2：PowerShell（Windows）

```powershell
Invoke-WebRequest -Uri "https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf" -OutFile "NotoSansCJKsc-Regular.otf"
```

### 方式 3：浏览器手动下载

1. 访问 https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf
2. 将下载的 `NotoSansCJKsc-Regular.otf` 放到本目录

## 说明

- 文件大小：约 16 MB
- 字重：Regular（常规）
- 许可：开源免费可商用（OFL 1.1）
- 字符覆盖：GB18030 全集，含简繁中文、日文、韩文
- **应用启动时会校验字体存在，缺失则启动失败并打印下载提示**

## 文件名说明

设计文档原命名 `NotoSansSC-Regular.otf` 在官方 Google Noto CJK 仓库中**不存在**。
官方正确文件名是 `NotoSansCJKsc-Regular.otf`（注意 "CJK" 和小写 "sc"）。
FontRegistry 会优先识别 `NotoSansCJKsc-Regular.otf`，同时也兼容 `NotoSansSC-Regular.otf`。

## 为什么需要中文字体？

Python `wordcloud` 库默认使用 `DroidSansMono`，**不含中文字形**。
若不显式传入中文字体路径，渲染中文词云会全是方块 □□□。
