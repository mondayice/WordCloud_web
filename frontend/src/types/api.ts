// 前后端 API 类型定义（与后端 schemas/ 对齐）

/** 形状预设 */
export interface ShapePreset {
  key: 'fill' | 'diamond' | 'heart' | 'circle' | 'star' | 'mask'
  label: string
  requires_mask: boolean
}

/** 配色方案（预设 builtin=true / 自定义 builtin=false） */
export interface ColorScheme {
  key: string
  label: string
  colors: string[]
  builtin: boolean
}

/** 自定义色数量限制 */
export interface CustomColorLimits {
  min: number
  max: number
}

/** 画布尺寸预设 */
export interface SizePreset {
  key: string
  label: string
  width: number
  height: number
}

/** GET /api/config 响应 */
export interface ConfigResponse {
  shapes: ShapePreset[]
  color_schemes: ColorScheme[]
  size_presets: SizePreset[]
  custom_color_limits: CustomColorLimits
}

/** 词频项 */
export interface WordFrequency {
  word: string
  count: number
}

/** POST /api/tokenize 响应 */
export interface TokenizeResponse {
  frequencies: WordFrequency[]
  total_words: number
  unique_words: number
}

/** 配色方案导入/导出文件格式 (.wc-colors.json) */
export interface ColorSchemeFile {
  format: 'wordcloud-studio-colors'
  version: 1
  schemes: ColorScheme[]
}
