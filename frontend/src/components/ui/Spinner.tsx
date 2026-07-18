import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

const SIZES = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' }

export function Spinner({ size = 'md', label = '加载中', className }: SpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin text-ink-muted', SIZES[size], className)}
      role="status"
      aria-label={label}
    />
  )
}
