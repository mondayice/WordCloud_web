import { useEffect } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '@/lib/cn'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  variant: ToastVariant
  title: string
  description?: string
  duration?: number
}

const ICONS: Record<ToastVariant, typeof Info> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

// 语义色：设计文档铁律"只有一个强调色（橙）"，所以
// success/warning/error 仅用 lucide 图标色 + aria 表达
const COLORS: Record<ToastVariant, string> = {
  success: 'text-emerald-500 dark:text-emerald-400',
  error: 'text-red-500 dark:text-red-400',
  warning: 'text-amber-500 dark:text-amber-400',
  info: 'text-ink-muted',
}

export function ToastItemView({
  toast,
  onDismiss,
}: {
  toast: ToastItem
  onDismiss: (id: string) => void
}) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), toast.duration ?? 4000)
    return () => clearTimeout(t)
  }, [toast.id, toast.duration, onDismiss])

  const Icon = ICONS[toast.variant]
  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex items-start gap-3',
        'bg-surface border border-border rounded-lg shadow-md px-4 py-3',
        'w-80',
      )}
    >
      <Icon
        className={cn('w-5 h-5 flex-shrink-0 mt-0.5', COLORS[toast.variant])}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-ink">{toast.title}</p>
        {toast.description && (
          <p className="text-2xs text-ink-muted mt-0.5">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="关闭通知"
        className="text-ink-faint hover:text-ink transition-colors"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  )
}

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2"
    >
      {toasts.map((t) => (
        <ToastItemView key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
