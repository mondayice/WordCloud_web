import { useAppStore } from '@/store/useAppStore'
import { Chip, ColorInput, Slider } from '@/components/ui'
import { ColorSchemeManager } from './ColorSchemeManager'
import { cn } from '@/lib/cn'
import type { ColorScheme } from '@/types/api'

interface StyleSectionProps {
  presetColorSchemes: ColorScheme[]
}

export function StyleSection({ presetColorSchemes }: StyleSectionProps) {
  const backgroundColor = useAppStore((s) => s.backgroundColor)
  const rotationSteps = useAppStore((s) => s.rotationSteps)
  const fontCustomEnabled = useAppStore((s) => s.fontCustomEnabled)
  const minFontSize = useAppStore((s) => s.minFontSize)
  const maxFontSize = useAppStore((s) => s.maxFontSize)

  const setBackgroundColor = useAppStore((s) => s.setBackgroundColor)
  const setRotationSteps = useAppStore((s) => s.setRotationSteps)
  const setFontCustomEnabled = useAppStore((s) => s.setFontCustomEnabled)
  const setMinFontSize = useAppStore((s) => s.setMinFontSize)
  const setMaxFontSize = useAppStore((s) => s.setMaxFontSize)

  // 字号档位描述映射
  const rotationLabel = (deg: number): string => {
    if (deg === 0) return '全部水平排列，阅读最流畅'
    if (deg === 90) return '全部垂直排列，适合竖排美学'
    const horizontal = Math.round(100 - (deg * 100) / 90)
    const vertical = 100 - horizontal
    return `约 ${horizontal}% 水平 + ${vertical}% 垂直`
  }

  return (
    <section className="flex flex-col gap-3 p-4 border-b border-border">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">样式</h3>

      {/* 配色方案：预设 + 自定义同级选择（自定义可编辑/导出/导入） */}
      <ColorSchemeManager presetSchemes={presetColorSchemes} />

      {/* 背景色 */}
      <div className="flex flex-col gap-1.5">
        <span className="text-2xs text-ink-faint">背景色</span>
        <ColorInput
          value={backgroundColor}
          onChange={setBackgroundColor}
          label="背景色"
          allowTransparent
        />
      </div>

      {/* 旋转角度 */}
      <div className="flex flex-col gap-1.5">
        <span className="text-2xs text-ink-faint">旋转角度</span>
        <div className="flex flex-wrap gap-1.5">
          {[0, 30, 45, 60, 90].map((deg) => (
            <Chip
              key={deg}
              active={rotationSteps === deg}
              onClick={() => setRotationSteps(deg)}
              title={rotationLabel(deg)}
            >
              {deg === 0 ? '全水平' : deg === 90 ? '全垂直' : `${deg}°`}
            </Chip>
          ))}
        </div>
        <p className="text-2xs text-ink-faint">{rotationLabel(rotationSteps)}</p>
      </div>

      {/* 字号控制：开关 + 双滑块 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-2xs text-ink-faint">字号范围</span>
          <button
            type="button"
            onClick={() => setFontCustomEnabled(!fontCustomEnabled)}
            aria-pressed={fontCustomEnabled}
            title={fontCustomEnabled ? '关闭自定义字号（使用自动算法）' : '启用自定义字号'}
            className={cn(
              'relative inline-flex h-4 w-7 items-center rounded-full transition-colors',
              fontCustomEnabled ? 'bg-accent' : 'bg-border',
            )}
          >
            <span
              className={cn(
                'inline-block h-3 w-3 transform rounded-full bg-white transition-transform',
                fontCustomEnabled ? 'translate-x-3.5' : 'translate-x-0.5',
              )}
            />
          </button>
        </div>

        {fontCustomEnabled ? (
          <>
            <Slider
              label="最小字号"
              min={4}
              max={50}
              step={1}
              value={minFontSize}
              onChange={(v) => {
                // 保证 min 不超过 max
                setMinFontSize(Math.min(v, maxFontSize - 1))
              }}
              formatValue={(v) => `${v}px`}
            />
            <Slider
              label="最大字号"
              min={50}
              max={300}
              step={1}
              value={maxFontSize}
              onChange={(v) => {
                // 保证 max 不小于 min
                setMaxFontSize(Math.max(v, minFontSize + 1))
              }}
              formatValue={(v) => `${v}px`}
            />
            <p className="text-2xs text-ink-faint">
              当前范围：{minFontSize}–{maxFontSize}px（共 {maxFontSize - minFontSize}px 跨度）
            </p>
          </>
        ) : (
          <p className="text-2xs text-ink-faint">
            自动模式：字号根据画布尺寸自适应
          </p>
        )}
      </div>
    </section>
  )
}
