import { cn } from '@/lib/cn'

export interface SelectOption {
  label: string
  value: string | number
}

export interface SelectProps {
  value: string | number
  options: SelectOption[]
  onChange: (value: string) => void
  ariaLabel?: string
  className?: string
  disabled?: boolean
}

export function Select({
  value,
  options,
  onChange,
  ariaLabel,
  className,
  disabled,
}: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'w-full h-9 rounded-md bg-surface border border-border px-3 text-xs text-ink',
        'cursor-pointer transition-colors',
        'focus:border-accent focus:ring-2 focus:ring-accent/30',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
