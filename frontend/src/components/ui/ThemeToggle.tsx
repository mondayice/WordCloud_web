import { Monitor, Moon, Sun } from 'lucide-react'
import { Button } from './Button'
import type { ThemePreference } from '@/lib/theme'

export interface ThemeToggleProps {
  preference: ThemePreference
  onToggle: () => void
  className?: string
}

const ICONS: Record<ThemePreference, { Icon: typeof Sun; label: string }> = {
  light: { Icon: Sun, label: '当前：浅色，点击切换到深色' },
  dark: { Icon: Moon, label: '当前：深色，点击切换到跟随系统' },
  system: { Icon: Monitor, label: '当前：跟随系统，点击切换到浅色' },
}

export function ThemeToggle({ preference, onToggle, className }: ThemeToggleProps) {
  const { Icon, label } = ICONS[preference]
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className={className}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
    </Button>
  )
}
