import { useCallback, useEffect, useState } from 'react'
import {
  applyTheme,
  nextTheme,
  readStoredTheme,
  writeStoredTheme,
  type ResolvedTheme,
  type ThemePreference,
} from '@/lib/theme'

export interface UseThemeReturn {
  preference: ThemePreference
  resolved: ResolvedTheme
  toggle: () => void
  setTheme: (p: ThemePreference) => void
}

export function useTheme(): UseThemeReturn {
  const [preference, setPreference] = useState<ThemePreference>(() => readStoredTheme())
  const [resolved, setResolved] = useState<ResolvedTheme>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  )

  useEffect(() => {
    writeStoredTheme(preference)
    setResolved(applyTheme(preference))
  }, [preference])

  // system 模式下监听系统主题实时变化
  useEffect(() => {
    if (preference !== 'system') return
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => setResolved(applyTheme('system'))
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [preference])

  const toggle = useCallback(() => {
    setPreference((prev) => nextTheme(prev))
  }, [])

  return { preference, resolved, toggle, setTheme: setPreference }
}
