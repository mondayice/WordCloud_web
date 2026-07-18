import type {
  ColorScheme,
  ConfigResponse,
  ShapePreset,
  TokenizeResponse,
  WordFrequency,
} from '@/types/api'

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

/** 统一错误：携带 HTTP 状态、消息、业务 code */
export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
    public code?: string,
  ) {
    super(detail)
    this.name = 'ApiError'
  }
}

async function safeReadError(res: Response): Promise<{ detail: string; code?: string }> {
  try {
    const data = await res.json()
    return { detail: data.detail ?? '请求失败', code: data.code }
  } catch {
    return { detail: `请求失败（HTTP ${res.status}）` }
  }
}

/** 获取预设配置 */
export async function fetchConfig(signal?: AbortSignal): Promise<ConfigResponse> {
  const res = await fetch(`${API_BASE}/config`, { signal })
  if (!res.ok) {
    const { detail, code } = await safeReadError(res)
    throw new ApiError(res.status, detail, code)
  }
  return res.json()
}

/** 分词 + 词频统计 */
export async function tokenize(
  params: {
    text?: string
    file?: File
    customDict?: File
    extraStopwords?: string
  },
  signal?: AbortSignal,
): Promise<TokenizeResponse> {
  const fd = new FormData()
  if (params.text) fd.append('text', params.text)
  if (params.file) fd.append('file', params.file)
  if (params.customDict) fd.append('custom_dict', params.customDict)
  if (params.extraStopwords) fd.append('extra_stopwords', params.extraStopwords)

  const res = await fetch(`${API_BASE}/tokenize`, {
    method: 'POST',
    body: fd,
    signal,
  })
  if (!res.ok) {
    const { detail, code } = await safeReadError(res)
    throw new ApiError(res.status, detail, code)
  }
  return res.json()
}

/** 生成词云参数 */
export interface GenerateWordCloudParams {
  frequencies?: WordFrequency[]
  text?: string
  file?: File
  customDict?: File
  extraStopwords?: string
  shape: ShapePreset['key']
  maskImage?: File
  // 配色源（二选一）：预设 key 或自定义颜色数组
  colorScheme?: string
  colors?: string[]
  backgroundColor: string
  width: number
  height: number
  preferHorizontal: number
  minFontSize: number
  rotationSteps: number
  format: 'png' | 'svg'
}

/** 生成词云图片，返回 blob */
export async function generateWordCloud(
  params: GenerateWordCloudParams,
  signal?: AbortSignal,
): Promise<{ blob: Blob; format: 'png' | 'svg' }> {
  if (!params.colorScheme && !params.colors) {
    throw new Error('必须提供 colorScheme 或 colors')
  }
  const fd = new FormData()
  if (params.frequencies) {
    fd.append('frequencies', JSON.stringify(params.frequencies))
  } else if (params.text) {
    fd.append('text', params.text)
  } else if (params.file) {
    fd.append('file', params.file)
  }
  if (params.customDict) fd.append('custom_dict', params.customDict)
  if (params.extraStopwords) fd.append('extra_stopwords', params.extraStopwords)
  fd.append('shape', params.shape)
  if (params.maskImage) fd.append('mask_image', params.maskImage)
  // 配色：预设用 color_scheme，自定义用 colors（后端二选一）
  if (params.colorScheme) {
    fd.append('color_scheme', params.colorScheme)
  } else if (params.colors) {
    fd.append('colors', JSON.stringify(params.colors))
  }
  fd.append('background_color', params.backgroundColor)
  fd.append('width', String(params.width))
  fd.append('height', String(params.height))
  fd.append('prefer_horizontal', String(params.preferHorizontal))
  fd.append('min_font_size', String(params.minFontSize))
  fd.append('rotation_steps', String(params.rotationSteps))
  fd.append('format', params.format)

  const res = await fetch(`${API_BASE}/wordcloud`, {
    method: 'POST',
    body: fd,
    signal,
  })
  if (!res.ok) {
    const { detail, code } = await safeReadError(res)
    throw new ApiError(res.status, detail, code)
  }
  const blob = await res.blob()
  return { blob, format: params.format }
}

/**
 * 导出配色方案为 .wc-colors.json 文件并触发下载
 */
export function exportColorSchemes(schemes: ColorScheme[], filename?: string): void {
  const fileData = {
    format: 'wordcloud-studio-colors' as const,
    version: 1,
    schemes: schemes.map((s) => ({
      key: s.key,
      label: s.label,
      colors: s.colors,
      builtin: false, // 导出统一为非内置，导入后即用户资产
    })),
  }
  const blob = new Blob([JSON.stringify(fileData, null, 2)], { type: 'application/json' })
  const name = filename ?? `wordcloud-colors-${new Date().toISOString().slice(0, 10)}.json`
  downloadBlob(blob, name)
}

/**
 * 从文件读取并解析配色方案
 * @throws Error 格式无效时抛出
 */
export async function importColorSchemes(file: File): Promise<ColorScheme[]> {
  const text = await file.text()
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('文件不是有效的 JSON')
  }
  if (typeof data !== 'object' || data === null) {
    throw new Error('文件格式无效')
  }
  const obj = data as { format?: unknown; schemes?: unknown }
  if (obj.format !== 'wordcloud-studio-colors') {
    throw new Error('文件格式标识不匹配（需 format: "wordcloud-studio-colors"）')
  }
  if (!Array.isArray(obj.schemes)) {
    throw new Error('schemes 字段必须是数组')
  }
  // 逐项校验
  const HEX_RE = /^#[0-9A-Fa-f]{6}$/
  const result: ColorScheme[] = []
  for (let i = 0; i < obj.schemes.length; i++) {
    const s = obj.schemes[i] as Partial<ColorScheme>
    if (typeof s.label !== 'string' || !s.label.trim()) {
      throw new Error(`第 ${i + 1} 套配色缺少有效 label`)
    }
    if (!Array.isArray(s.colors) || !s.colors.every((c) => typeof c === 'string' && HEX_RE.test(c))) {
      throw new Error(`第 ${i + 1} 套配色 colors 无效（需 2-12 个 #RRGGBB）`)
    }
    if (s.colors.length < 2 || s.colors.length > 12) {
      throw new Error(`第 ${i + 1} 套配色颜色数量需在 2-12 之间`)
    }
    result.push({
      key: typeof s.key === 'string' && s.key ? s.key : `imported-${Date.now()}-${i}`,
      label: s.label.trim(),
      colors: s.colors.map((c) => (c as string).toUpperCase()),
      builtin: false,
    })
  }
  return result
}

/** 触发浏览器下载 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // 延迟释放，避免下载未完成
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
