import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Drawer({ open, onClose, title, children }: DrawerProps) {
  // Esc 关闭（设计文档 B7 键盘要求）
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // 打开时锁定 body 滚动
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [open])

  return (
    <div
      className={cn('md:hidden fixed inset-0 z-50', open ? '' : 'pointer-events-none')}
      aria-hidden={!open}
    >
      {/* backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/40 transition-opacity duration-normal',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />
      {/* 抽屉：从底部滑出，85vh */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ?? '配置面板'}
        className={cn(
          'absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto',
          'bg-surface border-t border-border rounded-t-lg shadow-lg',
          'transition-transform duration-normal',
          open ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
          <h2 className="text-sm font-medium">{title}</h2>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="text-ink-muted hover:text-ink transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
