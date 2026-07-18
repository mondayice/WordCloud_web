import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { ColorScheme, ShapePreset, SizePreset, WordFrequency } from '@/types/api'

type LoadingStage = 'idle' | 'tokenizing' | 'rendering' | 'exporting'
type ThemePreference = 'light' | 'dark' | 'system'

interface Toast {
  id: string
  variant: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
}

// 当前选中的配色来源：预设 key 或自定义 schemeId（二选一）
export type SelectedColor =
  | { type: 'preset'; key: string }
  | { type: 'custom'; schemeId: string }

interface AppState {
  // ===== 参数（不持久化）=====
  inputText: string
  inputFile: File | null
  customDict: File | null
  extraStopwords: string
  shape: ShapePreset['key']
  maskImage: File | null
  selectedColor: SelectedColor
  editingScheme: ColorScheme | null
  backgroundColor: string
  rotationSteps: number
  // 字号控制：默认关闭，开启后使用 min/max 滑块值
  fontCustomEnabled: boolean
  minFontSize: number
  maxFontSize: number
  sizePreset: SizePreset

  // ===== 结果（不持久化）=====
  frequencies: WordFrequency[]
  totalWords: number
  uniqueWords: number
  previewBlob: Blob | null
  previewFormat: 'png' | 'svg' | null
  previewUrl: string | null

  // ===== UI 状态（不持久化）=====
  loadingStage: LoadingStage
  error: string | null
  toasts: Toast[]

  // ===== 持久化 =====
  theme: ThemePreference
  customColorSchemes: ColorScheme[]

  // Actions（通用）
  setInputText: (t: string) => void
  setInputFile: (f: File | null) => void
  setCustomDict: (f: File | null) => void
  setExtraStopwords: (s: string) => void
  setShape: (s: ShapePreset['key']) => void
  setMaskImage: (f: File | null) => void
  setBackgroundColor: (c: string) => void
  setRotationSteps: (n: number) => void
  setFontCustomEnabled: (enabled: boolean) => void
  setMinFontSize: (n: number) => void
  setMaxFontSize: (n: number) => void
  setSizePreset: (s: SizePreset) => void
  setTheme: (t: ThemePreference) => void
  setFrequencies: (f: WordFrequency[], total: number, unique: number) => void
  setPreview: (blob: Blob, format: 'png' | 'svg') => void
  setLoadingStage: (s: LoadingStage) => void
  setError: (e: string | null) => void
  addToast: (t: Omit<Toast, 'id'>) => void
  dismissToast: (id: string) => void
  reset: () => void

  // Actions（配色专用）
  selectPresetColor: (key: string) => void
  selectCustomColor: (schemeId: string) => void
  startEditColor: (scheme?: ColorScheme) => void
  updateEditingColor: (patch: Partial<ColorScheme>) => void
  addEditingColorSwatch: () => void
  removeEditingColorSwatch: (index: number) => void
  saveEditingColor: () => void
  cancelEditColor: () => void
  deleteCustomColor: (schemeId: string) => void
  importColorSchemes: (schemes: ColorScheme[]) => void
}

const DEFAULT_SIZE_PRESET: SizePreset = {
  key: 'default',
  label: '原始',
  width: 1920,
  height: 1080,
}

// 自定义配色颜色数量限制（与后端 custom_color_limits 一致）
const COLOR_LIMITS = { min: 2, max: 12 }

// 生成唯一 schemeId（避免与预设 key 冲突）
const genSchemeId = (): string =>
  `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // 初始状态
      inputText: '',
      inputFile: null,
      customDict: null,
      extraStopwords: '',
      shape: 'fill',
      maskImage: null,
      selectedColor: { type: 'preset', key: 'sunset' },
      editingScheme: null,
      backgroundColor: '#FAFAF9',
      rotationSteps: 0,
      fontCustomEnabled: false,
      minFontSize: 10,
      maxFontSize: 100,
      sizePreset: DEFAULT_SIZE_PRESET,

      frequencies: [],
      totalWords: 0,
      uniqueWords: 0,
      previewBlob: null,
      previewFormat: null,
      previewUrl: null,

      loadingStage: 'idle',
      error: null,
      toasts: [],

      theme: 'system',
      customColorSchemes: [],

      // Actions（通用）
      setInputText: (t) => set({ inputText: t }),
      setInputFile: (f) => set({ inputFile: f }),
      setCustomDict: (f) => set({ customDict: f }),
      setExtraStopwords: (s) => set({ extraStopwords: s }),
      setShape: (s) => set({ shape: s }),
      setMaskImage: (f) => set({ maskImage: f }),
      setBackgroundColor: (c) => set({ backgroundColor: c }),
      setRotationSteps: (n) => set({ rotationSteps: n }),
      setFontCustomEnabled: (enabled) => set({ fontCustomEnabled: enabled }),
      setMinFontSize: (n) => set({ minFontSize: n }),
      setMaxFontSize: (n) => set({ maxFontSize: n }),
      setSizePreset: (s) => set({ sizePreset: s }),
      setTheme: (t) => set({ theme: t }),
      setFrequencies: (f, total, unique) =>
        set({ frequencies: f, totalWords: total, uniqueWords: unique }),
      setPreview: (blob, format) =>
        set((state) => {
          // 释放旧的 ObjectURL 防内存泄漏
          if (state.previewUrl) URL.revokeObjectURL(state.previewUrl)
          return {
            previewBlob: blob,
            previewFormat: format,
            previewUrl: URL.createObjectURL(blob),
          }
        }),
      setLoadingStage: (s) => set({ loadingStage: s }),
      setError: (e) => set({ error: e }),
      addToast: (t) =>
        set((state) => ({
          toasts: [...state.toasts, { ...t, id: crypto.randomUUID() }],
        })),
      dismissToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),
      reset: () =>
        set({
          inputText: '',
          inputFile: null,
          frequencies: [],
          previewBlob: null,
          previewUrl: null,
          previewFormat: null,
          error: null,
          loadingStage: 'idle',
        }),

      // Actions（配色专用）
      selectPresetColor: (key) => set({ selectedColor: { type: 'preset', key } }),
      selectCustomColor: (schemeId) => set({ selectedColor: { type: 'custom', schemeId } }),

      startEditColor: (scheme) =>
        set({
          // 不传 scheme = 新建：初始化一个 2 色的草稿
          editingScheme: scheme
            ? { ...scheme }
            : {
                key: genSchemeId(),
                label: '我的配色',
                colors: ['#1C1917', '#FAFAF9'],
                builtin: false,
              },
        }),

      updateEditingColor: (patch) =>
        set((state) => ({
          editingScheme: state.editingScheme ? { ...state.editingScheme, ...patch } : null,
        })),

      addEditingColorSwatch: () =>
        set((state) => {
          if (!state.editingScheme) return {}
          if (state.editingScheme.colors.length >= COLOR_LIMITS.max) return {}
          return {
            editingScheme: {
              ...state.editingScheme,
              colors: [...state.editingScheme.colors, '#A8A29E'],
            },
          }
        }),

      removeEditingColorSwatch: (index) =>
        set((state) => {
          if (!state.editingScheme) return {}
          if (state.editingScheme.colors.length <= COLOR_LIMITS.min) return {}
          return {
            editingScheme: {
              ...state.editingScheme,
              colors: state.editingScheme.colors.filter((_, i) => i !== index),
            },
          }
        }),

      saveEditingColor: () =>
        set((state) => {
          const draft = state.editingScheme
          if (!draft) return {}
          const exists = state.customColorSchemes.some((s) => s.key === draft.key)
          const customColorSchemes = exists
            ? state.customColorSchemes.map((s) => (s.key === draft.key ? draft : s))
            : [...state.customColorSchemes, draft]
          return {
            customColorSchemes,
            editingScheme: null,
            selectedColor: { type: 'custom' as const, schemeId: draft.key },
          }
        }),

      cancelEditColor: () => set({ editingScheme: null }),

      deleteCustomColor: (schemeId) =>
        set((state) => {
          const customColorSchemes = state.customColorSchemes.filter(
            (s) => s.key !== schemeId,
          )
          // 若删除的正是当前选中项，回退到预设首项
          const selectedColor =
            state.selectedColor.type === 'custom' &&
            state.selectedColor.schemeId === schemeId
              ? ({ type: 'preset' as const, key: 'sunset' } as const)
              : state.selectedColor
          return { customColorSchemes, selectedColor }
        }),

      importColorSchemes: (schemes) =>
        set((state) => {
          // 去重合并：以 key 为准，导入的覆盖同 key 的现有项
          const map = new Map(state.customColorSchemes.map((s) => [s.key, s]))
          schemes.forEach((s) => {
            // 导入的强制 builtin=false，key 冲突则重新生成
            const key = map.has(s.key)
              ? `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
              : s.key
            map.set(key, { ...s, key, builtin: false })
          })
          return { customColorSchemes: Array.from(map.values()) }
        }),
    }),
    {
      name: 'wc-app', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // 持久化策略：theme + customColorSchemes（用户配色不丢失）
      // 不持久化 width/height（防旧值覆盖）、selectedColor/editingScheme（防引用已删除项）
      partialize: (state) => ({
        theme: state.theme,
        customColorSchemes: state.customColorSchemes,
      }),
    },
  ),
)

/** 辅助选择器：根据 selectedColor 解析出实际 HEX 列表（供 API 调用） */
export function resolveSelectedColors(
  state: AppState,
  presetSchemes: ColorScheme[],
): string[] | null {
  const selected = state.selectedColor
  if (selected.type === 'preset') {
    const found = presetSchemes.find((s) => s.key === selected.key)
    return found?.colors ?? null
  }
  // type === 'custom'
  const found = state.customColorSchemes.find((s) => s.key === selected.schemeId)
  return found?.colors ?? null
}

export { COLOR_LIMITS }
