import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  icon?: React.ReactNode
}

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  ({ active = false, icon, className, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1',
        'rounded-sm text-xs transition-colors duration-normal cursor-pointer select-none',
        // 颜色非唯一指示：激活态除颜色外还有字重加粗
        active
          ? 'bg-ink text-bg font-semibold'
          : 'bg-bg text-ink-muted font-medium hover:bg-border',
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  ),
)
Chip.displayName = 'Chip'
