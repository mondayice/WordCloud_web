const ERROR_LOG_KEY = 'wc-error-log'
const MAX_LOG_ENTRIES = 20

export interface ErrorLogEntry {
  timestamp: string
  message: string
  stack?: string
  url: string
}

/** 记录错误到 localStorage（不上报服务器） */
export function logError(error: Error): void {
  try {
    const log: ErrorLogEntry[] = JSON.parse(localStorage.getItem(ERROR_LOG_KEY) ?? '[]')
    log.unshift({
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      url: window.location.href,
    })
    localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(log.slice(0, MAX_LOG_ENTRIES)))
  } catch {
    // localStorage 不可用（隐私模式）→ 静默
  }
}

/** 获取错误日志（用于调试展示） */
export function getErrorLog(): ErrorLogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(ERROR_LOG_KEY) ?? '[]')
  } catch {
    return []
  }
}

/** 清空错误日志 */
export function clearErrorLog(): void {
  try {
    localStorage.removeItem(ERROR_LOG_KEY)
  } catch {
    // localStorage 不可用
  }
}
