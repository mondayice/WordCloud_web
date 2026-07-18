import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/cn'
import type { SizePreset } from '@/types/api'

interface SizeSectionProps {
  presets: SizePreset[]
}

export function SizeSection({ presets }: SizeSectionProps) {
  const sizePreset = useAppStore((s) => s.sizePreset)
  const setSizePreset = useAppStore((s) => s.setSizePreset)

  return (
    <section className="flex flex-col gap-3 p-4 border-b border-border">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">画布尺寸</h3>

      <div className="grid grid-cols-2 gap-2">
        {presets.map((p) => (
          <button
            key={p.key}
            onClick={() => setSizePreset(p)}
            aria-pressed={sizePreset.key === p.key}
            className={cn(
              'flex flex-col items-start px-3 py-2 rounded-md border transition-colors text-left',
              sizePreset.key === p.key
                ? 'border-accent ring-2 ring-accent/20 bg-accent/5'
                : 'border-border hover:bg-bg',
            )}
          >
            <span
              className={cn(
                'text-xs',
                sizePreset.key === p.key ? 'font-semibold text-ink' : 'text-ink',
              )}
            >
              {p.label}
            </span>
            <span className="text-2xs text-ink-faint font-mono">
              {p.width}×{p.height}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
