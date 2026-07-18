import { useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react'
import { Drawer } from '@/components/ui/Drawer'
import { cn } from '@/lib/cn'

export interface AppShellProps {
  header: ReactNode
  sidebar: ReactNode
  canvas: ReactNode
}

export function AppShell({ header, sidebar, canvas }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  // 桌面端 sidebar 折叠状态（默认展开）
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      {/* Header 始终可见 */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-surface flex-shrink-0">
        {header}
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* 桌面：固定左栏。md 起显示。折叠时宽度归零。 */}
        <aside
          className={cn(
            'hidden md:block bg-surface overflow-y-auto flex-shrink-0 transition-[width] duration-normal',
            sidebarCollapsed
              ? 'w-0 border-r-0 overflow-hidden'
              : 'md:w-[300px] lg:w-[360px] border-r border-border',
          )}
          aria-hidden={sidebarCollapsed}
        >
          {/* 内层 wrapper：折叠时仍保留 DOM（动画期间宽度过渡），但内容不渲染避免溢出 */}
          <div className={cn(sidebarCollapsed ? 'invisible' : 'visible')}>
            {sidebar}
          </div>
        </aside>

        {/* 边界把手：仅桌面显示，折叠/展开切换 */}
        <button
          onClick={() => setSidebarCollapsed((v) => !v)}
          aria-label={sidebarCollapsed ? '展开参数栏' : '收起参数栏'}
          aria-expanded={!sidebarCollapsed}
          title={sidebarCollapsed ? '展开参数栏' : '收起参数栏'}
          className={cn(
            'hidden md:flex absolute top-1/2 -translate-y-1/2 z-30',
            'h-8 w-8 items-center justify-center',
            'rounded-full bg-surface border border-border shadow-md',
            'text-ink-muted hover:text-ink hover:bg-bg',
            'transition-all duration-normal',
            // 折叠时贴左边缘（aside 宽度为 0），展开时贴 sidebar 右边缘
            sidebarCollapsed ? 'left-1' : 'left-[299px] lg:left-[359px]',
          )}
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          )}
        </button>

        {/* 右栏画布区 */}
        <main className="flex-1 relative overflow-hidden bg-bg">{canvas}</main>
      </div>

      {/* 移动端 FAB：< md 显示 */}
      <button
        onClick={() => setDrawerOpen(true)}
        aria-label="打开配置面板"
        className={cn(
          'md:hidden fixed bottom-4 left-4 z-30',
          'h-12 w-12 rounded-full shadow-lg',
          'bg-accent text-white flex items-center justify-center',
          'hover:bg-accent-hover transition-colors',
        )}
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* 移动端抽屉 */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="配置">
        {sidebar}
      </Drawer>
    </div>
  )
}
