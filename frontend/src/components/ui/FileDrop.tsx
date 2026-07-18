import { useCallback, useRef, useState } from 'react'
import { UploadCloud, File as FileIcon, X } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface FileDropProps {
  onFile: (file: File) => void
  accept?: string[]
  maxSize?: number
  label?: string
  hint?: string
  currentFile?: File | null
  onClear?: () => void
  className?: string
}

export function FileDrop({
  onFile,
  accept,
  maxSize,
  label,
  hint,
  currentFile,
  onClear,
  className,
}: FileDropProps) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validate = useCallback(
    (file: File): string | null => {
      if (accept && !accept.some((ext) => file.name.toLowerCase().endsWith(ext))) {
        return `仅支持 ${accept.join('/')} 文件`
      }
      if (maxSize && file.size > maxSize) {
        return `文件超过 ${Math.round(maxSize / 1024 / 1024)}MB 限制`
      }
      return null
    },
    [accept, maxSize],
  )

  const handleFile = useCallback(
    (file: File) => {
      const err = validate(file)
      if (err) {
        setError(err)
        return
      }
      setError(null)
      onFile(file)
    },
    [validate, onFile],
  )

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <span className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">
          {label}
        </span>
      )}
      {currentFile ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-surface border border-border">
          <FileIcon className="w-4 h-4 text-ink-muted flex-shrink-0" aria-hidden="true" />
          <span className="flex-1 text-xs text-ink truncate">{currentFile.name}</span>
          <span className="text-2xs text-ink-faint">
            {(currentFile.size / 1024).toFixed(1)}KB
          </span>
          {onClear && (
            <button
              onClick={onClear}
              aria-label="移除文件"
              className="text-ink-faint hover:text-ink transition-colors"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
          }}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
          }}
          tabIndex={0}
          role="button"
          aria-label={label ?? '点击或拖拽上传文件'}
          className={cn(
            'flex flex-col items-center justify-center gap-1.5 px-3 py-6',
            'rounded-md border border-dashed cursor-pointer transition-colors',
            dragging ? 'border-accent bg-accent/5' : 'border-border bg-surface hover:bg-bg',
          )}
        >
          <UploadCloud
            className="w-6 h-6 text-ink-faint"
            aria-hidden="true"
            strokeWidth={1.5}
          />
          <p className="text-2xs text-ink-muted">点击或拖拽文件到此处</p>
          {hint && <p className="text-2xs text-ink-faint">{hint}</p>}
        </div>
      )}
      {error && (
        <p role="alert" className="text-2xs text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept?.join(',')}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0])
        }}
      />
    </div>
  )
}
