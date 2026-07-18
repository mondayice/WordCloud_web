import { useAppStore } from '@/store/useAppStore'
import { Chip, ColorInput, Slider } from '@/components/ui'
import { ColorSchemeManager } from './ColorSchemeManager'
import type { ColorScheme } from '@/types/api'

interface StyleSectionProps {
  presetColorSchemes: ColorScheme[]
}

export function StyleSection({ presetColorSchemes }: StyleSectionProps) {
  const backgroundColor = useAppStore((s) => s.backgroundColor)
  const preferHorizontal = useAppStore((s) => s.preferHorizontal)
  const rotationSteps = useAppStore((s) => s.rotationSteps)

  const setBackgroundColor = useAppStore((s) => s.setBackgroundColor)
  const setPreferHorizontal = useAppStore((s) => s.setPreferHorizontal)
  const setRotationSteps = useAppStore((s) => s.setRotationSteps)

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

      {/* 水平排版比例 */}
      <Slider
        label="水平排版比例"
        min={0}
        max={1}
        step={0.1}
        value={preferHorizontal}
        onChange={setPreferHorizontal}
        formatValue={(v) => `${Math.round(v * 100)}%`}
      />

      {/* 旋转角度 */}
      <div className="flex flex-col gap-1.5">
        <span className="text-2xs text-ink-faint">旋转角度</span>
        <div className="flex flex-wrap gap-1.5">
          {[0, 30, 45, 60, 90].map((deg) => (
            <Chip
              key={deg}
              active={rotationSteps === deg}
              onClick={() => setRotationSteps(deg)}
              title={
                deg === 0
                  ? '全水平'
                  : deg === 90
                    ? '全垂直'
                    : `约 ${(100 - deg * 100 / 90).toFixed(0)}% 水平 / ${(deg * 100 / 90).toFixed(0)}% 垂直`
              }
            >
              {deg === 0 ? '水平' : `${deg}°`}
            </Chip>
          ))}
        </div>
        <p className="text-2xs text-ink-faint">
          角度越大垂直词越多（0° 全水平 → 90° 全垂直）
        </p>
      </div>
    </section>
  )
}
