import { useState } from 'react'
import { ChevronUp, Download, FileImage, FileType2 } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Button } from './Button'
import { cn } from '@/lib/cn'
import { downloadBlob, generateWordCloud } from '@/lib/api'
import type { SizePreset } from '@/types/api'

interface ExportBarProps {
  presets: SizePreset[]
}

export function ExportBar({ presets }: ExportBarProps) {
  const [open, setOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'png' | 'svg'>('png')

  const store = useAppStore()
  const addToast = useAppStore((s) => s.addToast)
  const setLoadingStage = useAppStore((s) => s.setLoadingStage)

  const handleExport = async (format: 'png' | 'svg', preset: SizePreset) => {
    setExporting(true)
    setLoadingStage('exporting')
    try {
      // 根据 selectedColor 类型解析配色来源（先取局部变量再 narrow）
      const selected = store.selectedColor
      const colorParams =
        selected.type === 'preset'
          ? { colorScheme: selected.key }
          : {
              colors: store.customColorSchemes.find((s) => s.key === selected.schemeId)
                ?.colors,
            }
      const { blob } = await generateWordCloud({
        frequencies: store.frequencies,
        shape: store.shape,
        maskImage: store.maskImage ?? undefined,
        ...colorParams,
        backgroundColor: store.backgroundColor,
        width: preset.width,
        height: preset.height,
        rotationSteps: store.rotationSteps,
        fontCustomEnabled: store.fontCustomEnabled,
        minFontSize: store.minFontSize,
        maxFontSize: store.maxFontSize,
        format,
      })
      const filename = `wordcloud-${preset.key}-${preset.width}x${preset.height}.${format}`
      downloadBlob(blob, filename)
      addToast({
        variant: 'success',
        title: '导出成功',
        description: `${preset.label} ${format.toUpperCase()} 已下载`,
      })
    } catch (e) {
      addToast({
        variant: 'error',
        title: '导出失败',
        description: e instanceof Error ? e.message : '未知错误',
      })
    } finally {
      setExporting(false)
      setLoadingStage('idle')
      setOpen(false)
    }
  }

  return (
    <div className="absolute bottom-4 right-4 z-20">
      {/* 浮层（向上展开） */}
      {open && (
        <div
          className={cn(
            'absolute right-0 bottom-full mb-2 w-64',
            'bg-surface border border-border rounded-lg shadow-lg p-4 z-20',
          )}
        >
          <div className="flex flex-col gap-3">
            <div className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">
              格式
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FormatButton
                icon={<FileImage className="w-4 h-4" />}
                label="PNG"
                active={exportFormat === 'png'}
                onClick={() => setExportFormat('png')}
              />
              <FormatButton
                icon={<FileType2 className="w-4 h-4" />}
                label="SVG"
                active={exportFormat === 'svg'}
                onClick={() => setExportFormat('svg')}
              />
            </div>

            <div className="text-2xs font-semibold uppercase tracking-wider text-ink-faint mt-2">
              尺寸
            </div>
            <div className="flex flex-col gap-1">
              {presets.map((p) => (
                <button
                  key={p.key}
                  onClick={() => handleExport(exportFormat, p)}
                  disabled={exporting}
                  className="flex items-center justify-between px-2 py-1.5 rounded-md text-xs text-ink hover:bg-bg transition-colors disabled:opacity-50"
                >
                  <span>
                    {p.label}{' '}
                    <span className="text-2xs text-ink-faint font-mono">
                      {p.width}×{p.height}
                    </span>
                  </span>
                  <span className="text-2xs text-ink-faint font-mono">
                    {exportFormat.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 触发按钮 */}
      <Button
        variant="accent"
        size="md"
        onClick={() => setOpen(!open)}
        disabled={exporting}
        isLoading={exporting}
        leftIcon={!exporting ? <Download className="w-4 h-4" aria-hidden="true" /> : undefined}
        rightIcon={
          !exporting ? (
            <ChevronUp
              className={cn('w-3 h-3 transition-transform', open ? '' : 'rotate-180')}
              aria-hidden="true"
            />
          ) : undefined
        }
        className="shadow-md"
      >
        {exporting ? '导出中…' : '下载'}
      </Button>
    </div>
  )
}

function FormatButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs transition-colors',
        active
          ? 'bg-accent/10 text-accent border border-accent/30'
          : 'bg-bg text-ink-muted border border-transparent hover:bg-border',
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
