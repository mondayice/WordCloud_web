import { useState } from 'react'
import { ClipboardPaste, Eraser } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { FileDrop } from '@/components/ui/FileDrop'
import { cn } from '@/lib/cn'

const MIN_CHARS = 20
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

type InputTab = 'text' | 'file'

export function InputSection() {
  const inputText = useAppStore((s) => s.inputText)
  const inputFile = useAppStore((s) => s.inputFile)
  const setInputText = useAppStore((s) => s.setInputText)
  const setInputFile = useAppStore((s) => s.setInputFile)
  const addToast = useAppStore((s) => s.addToast)

  // 当前激活的 Tab：有文件时默认显示文件页，否则文本页
  const [activeTab, setActiveTab] = useState<InputTab>(
    inputFile ? 'file' : 'text',
  )

  const charCount = inputText.length
  const isValid = charCount >= MIN_CHARS || inputFile !== null

  // 从剪贴板读取文本
  const handlePaste = async () => {
    try {
      // 优先用现代 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        const text = await navigator.clipboard.readText()
        if (!text) {
          addToast({ variant: 'warning', title: '剪贴板为空' })
          return
        }
        // 追加而非覆盖：避免误清空用户已有内容
        setInputText(inputText + text)
        addToast({
          variant: 'success',
          title: '已粘贴',
          description: `新增 ${text.length} 字符`,
        })
        return
      }
      // 兜底：HTTP（非 HTTPS/localhost）环境无法访问 Clipboard API
      addToast({
        variant: 'warning',
        title: '无法访问剪贴板',
        description: '请使用 Ctrl+V 手动粘贴，或通过 HTTPS 访问',
      })
    } catch {
      addToast({
        variant: 'error',
        title: '粘贴失败',
        description: '浏览器拒绝了剪贴板读取权限',
      })
    }
  }

  // 清空文本框
  const handleClear = () => {
    if (!inputText) return
    setInputText('')
    addToast({ variant: 'info', title: '已清空文本' })
  }

  return (
    <section className="flex flex-col gap-3 p-4 border-b border-border">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
        输入文本
      </h3>

      {/* Tab 切换头 */}
      <div
        role="tablist"
        aria-label="输入方式"
        className="flex bg-bg rounded-md p-0.5 border border-border"
      >
        <button
          role="tab"
          aria-selected={activeTab === 'text'}
          aria-controls="input-text-panel"
          id="input-text-tab"
          onClick={() => setActiveTab('text')}
          className={cn(
            'flex-1 h-8 px-3 rounded-sm text-xs font-medium transition-colors cursor-pointer',
            activeTab === 'text'
              ? 'bg-surface text-ink shadow-sm'
              : 'text-ink-muted hover:text-ink',
          )}
        >
          粘贴文本
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'file'}
          aria-controls="input-file-panel"
          id="input-file-tab"
          onClick={() => setActiveTab('file')}
          className={cn(
            'flex-1 h-8 px-3 rounded-sm text-xs font-medium transition-colors cursor-pointer',
            activeTab === 'file'
              ? 'bg-surface text-ink shadow-sm'
              : 'text-ink-muted hover:text-ink',
          )}
        >
          上传文件
        </button>
      </div>

      {/* 文本输入面板 */}
      {activeTab === 'text' && (
        <div
          role="tabpanel"
          id="input-text-panel"
          aria-labelledby="input-text-tab"
          className="flex flex-col gap-1.5"
        >
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="在此粘贴或输入中英文文本…（至少 20 字符）"
            rows={6}
            className={cn(
              'w-full rounded-md bg-surface border p-3 text-xs text-ink resize-y',
              'placeholder:text-ink-faint transition-colors',
              'focus:border-accent focus:ring-2 focus:ring-accent/30',
              'border-border',
            )}
            aria-label="文本输入"
          />

          {/* 操作按钮行：粘贴 / 清除 + 字数统计 */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={handlePaste}
                aria-label="从剪贴板粘贴"
                title="从剪贴板粘贴"
                className={cn(
                  'inline-flex items-center gap-1 h-7 px-2 rounded-sm',
                  'text-2xs text-ink-muted hover:text-ink hover:bg-bg',
                  'transition-colors cursor-pointer',
                )}
              >
                <ClipboardPaste className="w-3 h-3" aria-hidden="true" />
                粘贴
              </button>
              <button
                onClick={handleClear}
                disabled={!inputText}
                aria-label="清除文本"
                title="清除文本"
                className={cn(
                  'inline-flex items-center gap-1 h-7 px-2 rounded-sm',
                  'text-2xs text-ink-muted hover:text-red-500 hover:bg-bg',
                  'transition-colors cursor-pointer',
                  'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-ink-muted',
                )}
              >
                <Eraser className="w-3 h-3" aria-hidden="true" />
                清除
              </button>
            </div>

            {/* 字数统计 + 校验提示 */}
            <div className="flex items-center gap-2 text-2xs">
              <span className={cn(isValid ? 'text-ink-faint' : 'text-amber-500')}>
                {charCount < MIN_CHARS
                  ? `还需 ${MIN_CHARS - charCount} 字符`
                  : '已满足'}
              </span>
              <span className="font-mono text-ink-faint">{charCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* 文件上传面板 */}
      {activeTab === 'file' && (
        <div
          role="tabpanel"
          id="input-file-panel"
          aria-labelledby="input-file-tab"
          className="flex flex-col gap-1.5"
        >
          <FileDrop
            accept={['.txt']}
            maxSize={MAX_FILE_SIZE}
            hint=".txt 文件，≤5MB，自动识别 UTF-8/GBK 编码"
            currentFile={inputFile}
            onFile={setInputFile}
            onClear={() => setInputFile(null)}
          />
          {/* 文件模式下也显示文本字数（如果有），便于切换 Tab 时了解状态 */}
          {inputText && (
            <p className="text-2xs text-ink-faint">
              提示：切换到"粘贴文本"可查看/编辑已有 {inputText.length} 字符
            </p>
          )}
        </div>
      )}
    </section>
  )
}
