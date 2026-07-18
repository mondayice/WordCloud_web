import { cn } from '@/lib/cn'

export interface FieldProps {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="text-2xs font-semibold uppercase tracking-wider text-ink-faint"
      >
        {label}
        {required && (
          <span aria-hidden="true" className="text-accent ml-0.5">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="text-2xs text-ink-faint">{hint}</p>}
      {error && (
        <p role="alert" className="text-2xs text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
