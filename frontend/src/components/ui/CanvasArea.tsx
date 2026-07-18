import { type ReactNode } from 'react'
import { AlertCircle, FileText, RotateCcw } from 'lucide-react'
import { Button, Spinner } from '@/components/ui'
import { cn } from '@/lib/cn'

export type CanvasStatus = 'empty' | 'loading' | 'ready' | 'error'

export interface CanvasAreaProps {
  status: CanvasStatus
  loadingLabel?: string
  errorMessage?: string
  onRetry?: () => void
  children?: ReactNode
  wordCount?: number
}

export function CanvasArea({
  status,
  loadingLabel = '处理中…',
  errorMessage,
  onRetry,
  children,
}: CanvasAreaProps) {
  if (status === 'ready' && children) {
    return <div className="w-full h-full">{children}</div>
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 w-full h-full text-center',
        'p-8',
      )}
      role="status"
      aria-live="polite"
    >
      {status === 'empty' && (
        <>
          <FileText className="w-12 h-12 text-ink-faint" aria-hidden="true" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-medium text-ink-muted">尚未生成词云</p>
            <p className="text-2xs text-ink-faint mt-1">在左侧输入文本，点击生成按钮</p>
          </div>
        </>
      )}

      {status === 'loading' && (
        <>
          <Spinner size="lg" label={loadingLabel} />
          <p className="text-xs text-ink-muted">{loadingLabel}</p>
        </>
      )}

      {status === 'error' && (
        <>
          <AlertCircle
            className="w-12 h-12 text-red-500 dark:text-red-400"
            aria-hidden="true"
            strokeWidth={1.5}
          />
          <div>
            <p className="text-sm font-medium text-ink">生成失败</p>
            <p className="text-2xs text-ink-muted mt-1 max-w-sm">
              {errorMessage ?? '请重试'}
            </p>
          </div>
          {onRetry && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRetry}
              leftIcon={<RotateCcw className="w-4 h-4" aria-hidden="true" />}
            >
              重试
            </Button>
          )}
        </>
      )}
    </div>
  )
}
