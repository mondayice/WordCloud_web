import { useRef } from 'react'
import { Check, Download, Pencil, Plus, Trash2, Upload, X } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Button, TextInput } from '@/components/ui'
import { exportColorSchemes, importColorSchemes } from '@/lib/api'
import { cn } from '@/lib/cn'
import type { ColorScheme } from '@/types/api'

interface ColorSchemeManagerProps {
  presetSchemes: ColorScheme[]
}

export function ColorSchemeManager({ presetSchemes }: ColorSchemeManagerProps) {
  const selectedColor = useAppStore((s) => s.selectedColor)
  const customColorSchemes = useAppStore((s) => s.customColorSchemes)
  const editingScheme = useAppStore((s) => s.editingScheme)

  const selectPresetColor = useAppStore((s) => s.selectPresetColor)
  const selectCustomColor = useAppStore((s) => s.selectCustomColor)
  const startEditColor = useAppStore((s) => s.startEditColor)
  const deleteCustomColor = useAppStore((s) => s.deleteCustomColor)
  const importColorSchemesAction = useAppStore((s) => s.importColorSchemes)
  const addToast = useAppStore((s) => s.addToast)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const isSelected = (s: ColorScheme): boolean =>
    s.builtin
      ? selectedColor.type === 'preset' && selectedColor.key === s.key
      : selectedColor.type === 'custom' && selectedColor.schemeId === s.key

  const handleImport = async (file: File) => {
    try {
      const schemes = await importColorSchemes(file)
      importColorSchemesAction(schemes)
      addToast({
        variant: 'success',
        title: '导入成功',
        description: `已导入 ${schemes.length} 套配色`,
      })
    } catch (e) {
      addToast({
        variant: 'error',
        title: '导入失败',
        description: e instanceof Error ? e.message : '文件解析错误',
      })
    }
  }

  const handleExport = () => {
    if (customColorSchemes.length === 0) {
      addToast({ variant: 'warning', title: '没有可导出的自定义配色' })
      return
    }
    exportColorSchemes(customColorSchemes)
    addToast({
      variant: 'success',
      title: '导出成功',
      description: `${customColorSchemes.length} 套配色已下载`,
    })
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-2xs text-ink-faint">配色方案</span>
        <div className="flex items-center gap-1">
          {/* 导入 */}
          <button
            onClick={() => fileInputRef.current?.click()}
            aria-label="导入配色方案"
            title="导入配色方案"
            className="text-ink-faint hover:text-ink transition-colors p-1"
          >
            <Upload className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          {/* 导出 */}
          <button
            onClick={handleExport}
            aria-label="导出配色方案"
            title="导出自定义配色"
            className="text-ink-faint hover:text-ink transition-colors p-1"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          {/* 新建 */}
          <button
            onClick={() => startEditColor()}
            aria-label="新建自定义配色"
            title="新建自定义配色"
            className="text-ink-faint hover:text-accent transition-colors p-1"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleImport(f)
            e.target.value = '' // 允许重复选择同一文件
          }}
        />
      </div>

      {/* 预设配色（builtin=true） */}
      <div className="grid grid-cols-2 gap-2">
        {presetSchemes.map((cs) => (
          <ColorSchemeCard
            key={cs.key}
            scheme={cs}
            selected={isSelected(cs)}
            onSelect={() => selectPresetColor(cs.key)}
          />
        ))}
      </div>

      {/* 自定义配色（builtin=false） */}
      {customColorSchemes.length > 0 && (
        <>
          <div className="flex items-center gap-2 mt-2 text-2xs text-ink-faint">
            <div className="flex-1 border-t border-border" />
            <span>自定义</span>
            <div className="flex-1 border-t border-border" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {customColorSchemes.map((cs) => (
              <ColorSchemeCard
                key={cs.key}
                scheme={cs}
                selected={isSelected(cs)}
                onSelect={() => selectCustomColor(cs.key)}
                onEdit={() => startEditColor(cs)}
                onDelete={() => deleteCustomColor(cs.key)}
              />
            ))}
          </div>
        </>
      )}

      {/* 内联编辑器（新建/编辑时展开） */}
      {editingScheme && <ColorSchemeEditor />}
    </div>
  )
}

/** 单个配色卡片：色板预览 + 标签 + 选中态 + 操作按钮（仅自定义） */
function ColorSchemeCard({
  scheme,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: {
  scheme: ColorScheme
  selected: boolean
  onSelect: () => void
  onEdit?: () => void
  onDelete?: () => void
}) {
  return (
    <div
      className={cn(
        'group relative flex items-center gap-2 px-2 py-1.5 rounded-md border transition-colors cursor-pointer',
        selected
          ? 'border-accent ring-2 ring-accent/20 font-semibold'
          : 'border-border hover:bg-bg',
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
    >
      {/* 色板预览 */}
      <div className="flex h-4 rounded-sm overflow-hidden flex-shrink-0">
        {scheme.colors.map((c, i) => (
          <div key={i} className="w-2.5 h-full" style={{ backgroundColor: c }} />
        ))}
      </div>
      <span className="flex-1 text-xs text-ink truncate">{scheme.label}</span>

      {/* 操作按钮：仅自定义配色显示，hover 时浮现 */}
      {!scheme.builtin && (onEdit || onDelete) && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              aria-label={`编辑 ${scheme.label}`}
              className="text-ink-faint hover:text-ink p-0.5"
            >
              <Pencil className="w-3 h-3" aria-hidden="true" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              aria-label={`删除 ${scheme.label}`}
              className="text-ink-faint hover:text-red-500 p-0.5"
            >
              <Trash2 className="w-3 h-3" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/** 配色编辑器：命名 + 颜色增删改 + 保存/取消 */
function ColorSchemeEditor() {
  const editingScheme = useAppStore((s) => s.editingScheme)
  const updateEditingColor = useAppStore((s) => s.updateEditingColor)
  const addEditingColorSwatch = useAppStore((s) => s.addEditingColorSwatch)
  const removeEditingColorSwatch = useAppStore((s) => s.removeEditingColorSwatch)
  const saveEditingColor = useAppStore((s) => s.saveEditingColor)
  const cancelEditColor = useAppStore((s) => s.cancelEditColor)
  const addToast = useAppStore((s) => s.addToast)

  if (!editingScheme) return null

  const { label, colors } = editingScheme
  const MAX = 12
  const MIN = 2

  const handleSave = () => {
    if (!label.trim()) {
      addToast({ variant: 'warning', title: '请填写配色名称' })
      return
    }
    saveEditingColor()
    addToast({ variant: 'success', title: '配色已保存' })
  }

  return (
    <div className="mt-2 p-3 rounded-md border border-border bg-bg flex flex-col gap-3">
      {/* 名称 */}
      <div className="flex flex-col gap-1">
        <label className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">
          名称
        </label>
        <TextInput
          value={label}
          onChange={(e) => updateEditingColor({ label: e.target.value })}
          placeholder="如：我的暖调"
          aria-label="配色名称"
          maxLength={20}
        />
      </div>

      {/* 颜色列表 */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">
            颜色（{colors.length}/{MAX}）
          </span>
          <button
            onClick={addEditingColorSwatch}
            disabled={colors.length >= MAX}
            aria-label="添加颜色"
            className="text-ink-faint hover:text-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex flex-col gap-1.5">
          {colors.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="color"
                value={c}
                onChange={(e) => {
                  const next = [...colors]
                  next[i] = e.target.value.toUpperCase()
                  updateEditingColor({ colors: next })
                }}
                className="w-7 h-7 rounded-sm border border-border cursor-pointer bg-surface flex-shrink-0"
                aria-label={`第 ${i + 1} 个颜色`}
              />
              <input
                type="text"
                value={c}
                onChange={(e) => {
                  const v = e.target.value
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) {
                    const next = [...colors]
                    next[i] = v.toUpperCase()
                    updateEditingColor({ colors: next })
                  }
                }}
                className="flex-1 h-7 rounded-md bg-surface border border-border px-2 text-2xs font-mono text-ink focus:border-accent focus:ring-2 focus:ring-accent/30"
                aria-label={`第 ${i + 1} 个颜色 HEX 值`}
                maxLength={7}
              />
              <button
                onClick={() => removeEditingColorSwatch(i)}
                disabled={colors.length <= MIN}
                aria-label={`删除第 ${i + 1} 个颜色`}
                className="text-ink-faint hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-1"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <p className="text-2xs text-ink-faint">
          颜色数量 {MIN}-{MAX}，大词优先使用靠前的颜色
        </p>
      </div>

      {/* 操作 */}
      <div className="flex gap-2">
        <Button
          variant="accent"
          size="sm"
          onClick={handleSave}
          leftIcon={<Check className="w-3.5 h-3.5" />}
        >
          保存
        </Button>
        <Button variant="ghost" size="sm" onClick={cancelEditColor}>
          取消
        </Button>
      </div>
    </div>
  )
}
