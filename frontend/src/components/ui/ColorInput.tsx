import { cn } from '@/lib/cn'

export interface ColorInputProps {
  value: string
  onChange: (hex: string) => void
  label?: string
  allowTransparent?: boolean
  className?: string
}

export function ColorInput({
  value,
  onChange,
  label,
  allowTransparent,
  className,
}: ColorInputProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <input
        type="color"
        value={value === 'transparent' ? '#000000' : value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded-sm border border-border cursor-pointer bg-surface"
        aria-label={label}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 h-9 rounded-md bg-surface border border-border px-2 text-xs font-mono text-ink focus:border-accent focus:ring-2 focus:ring-accent/30"
        aria-label={`${label} HEX 值`}
      />
      {allowTransparent && (
        <button
          type="button"
          onClick={() => onChange('transparent')}
          className="text-2xs text-ink-faint hover:text-ink transition-colors"
        >
          透明
        </button>
      )}
    </div>
  )
}
