import { useAppStore } from '@/store/useAppStore'
import { Chip } from '@/components/ui/Chip'
import { FileDrop } from '@/components/ui/FileDrop'
import type { ShapePreset } from '@/types/api'

const MAX_MASK_SIZE = 10 * 1024 * 1024 // 10MB

// 形状图标用文字示意（避免额外资源）
const SHAPE_ICONS: Record<string, string> = {
  fill: '▰',
  diamond: '◆',
  heart: '♥',
  circle: '●',
  star: '★',
  mask: '▣',
}

interface ShapeSectionProps {
  shapes: ShapePreset[]
}

export function ShapeSection({ shapes }: ShapeSectionProps) {
  const shape = useAppStore((s) => s.shape)
  const maskImage = useAppStore((s) => s.maskImage)
  const setShape = useAppStore((s) => s.setShape)
  const setMaskImage = useAppStore((s) => s.setMaskImage)

  return (
    <section className="flex flex-col gap-3 p-4 border-b border-border">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">形状</h3>

      <div className="grid grid-cols-3 gap-2">
        {shapes.map((s) => (
          <Chip
            key={s.key}
            active={shape === s.key}
            onClick={() => setShape(s.key)}
            className="flex-col h-16 gap-1"
          >
            <span className="text-base" aria-hidden="true">
              {SHAPE_ICONS[s.key] ?? '◻'}
            </span>
            <span>{s.label}</span>
          </Chip>
        ))}
      </div>

      {shape === 'mask' && (
        <FileDrop
          label="遮罩图片"
          accept={['.png', '.jpg', '.jpeg']}
          maxSize={MAX_MASK_SIZE}
          hint="白色区域绘制词，黑色区域留空。≤10MB"
          currentFile={maskImage}
          onFile={setMaskImage}
          onClear={() => setMaskImage(null)}
        />
      )}
    </section>
  )
}
