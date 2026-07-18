import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
  leftIcon?: React.ReactNode
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ invalid, leftIcon, className, ...props }, ref) => (
    <div className="relative">
      {leftIcon && (
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none">
          {leftIcon}
        </span>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full h-9 rounded-md bg-surface border text-xs text-ink',
          'placeholder:text-ink-faint',
          'transition-colors duration-normal',
          leftIcon ? 'pl-9 pr-3' : 'px-3',
          invalid
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/30'
            : 'border-border focus:border-accent focus:ring-2 focus:ring-accent/30',
          className,
        )}
        aria-invalid={invalid || undefined}
        {...props}
      />
    </div>
  ),
)
TextInput.displayName = 'TextInput'
