import { cn } from '@/lib/cn'

export interface SliderProps {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  label?: string
  formatValue?: (v: number) => string
  className?: string
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  formatValue,
  className,
}: SliderProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <div className="flex justify-between text-2xs text-ink-faint">
          <span>{label}</span>
          <span className="font-mono">{formatValue ? formatValue(value) : value}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          'w-full h-1.5 rounded-full appearance-none cursor-pointer',
          'bg-border accent-accent',
        )}
        aria-label={label}
      />
    </div>
  )
}
