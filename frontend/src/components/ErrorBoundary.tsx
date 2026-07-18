import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { logError } from '@/lib/errorHandler'

interface Props {
  children: ReactNode
}
interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logError(error)
    console.error('未捕获错误：', error, info)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-bg text-ink p-8">
          <AlertCircle
            className="w-12 h-12 text-red-500"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <div className="text-center">
            <h1 className="text-xl font-medium">应用出现错误</h1>
            <p className="text-xs text-ink-muted mt-2 max-w-md">
              {this.state.error?.message ?? '未知错误'}
            </p>
            <p className="text-2xs text-ink-faint mt-1">
              错误已记录到本地，刷新或重试可能解决问题
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            刷新页面
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
