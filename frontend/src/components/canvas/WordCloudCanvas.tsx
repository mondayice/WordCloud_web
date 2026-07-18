import { useCallback, useEffect, useRef, useState } from 'react'
import { Minus, Plus, RotateCcw } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { CanvasArea, ExportBar } from '@/components/ui'
import type { CanvasStatus } from '@/components/ui/CanvasArea'
import { cn } from '@/lib/cn'
import type { SizePreset } from '@/types/api'

interface WordCloudCanvasProps {
  sizePresets: SizePreset[]
}

// 缩放范围与步长
const MIN_SCALE = 0.1
const MAX_SCALE = 5
const WHEEL_STEP = 0.0015 // deltaY 系数（deltaY 通常 100 左右 → 15% 缩放）

interface ZoomState {
  scale: number
  tx: number
  ty: number
}

const INITIAL_ZOOM: ZoomState = { scale: 1, tx: 0, ty: 0 }

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

export function WordCloudCanvas({ sizePresets }: WordCloudCanvasProps) {
  const previewUrl = useAppStore((s) => s.previewUrl)
  const previewFormat = useAppStore((s) => s.previewFormat)
  const loadingStage = useAppStore((s) => s.loadingStage)
  const error = useAppStore((s) => s.error)
  const frequencies = useAppStore((s) => s.frequencies)
  const setError = useAppStore((s) => s.setError)

  const status: CanvasStatus = error
    ? 'error'
    : loadingStage === 'rendering' || loadingStage === 'tokenizing'
      ? 'loading'
      : previewUrl
        ? 'ready'
        : 'empty'

  const loadingLabel =
    loadingStage === 'tokenizing'
      ? '分词中…'
      : loadingStage === 'rendering'
        ? '渲染词云中…'
        : '处理中…'

  return (
    <div className="relative w-full h-full">
      <CanvasArea
        status={status}
        loadingLabel={loadingLabel}
        errorMessage={error ?? undefined}
        onRetry={() => setError(null)}
        wordCount={frequencies.length}
      >
        {previewUrl && previewFormat && (
          <PreviewContent
            url={previewUrl}
            format={previewFormat}
            wordCount={frequencies.length}
          />
        )}
      </CanvasArea>

      {status === 'ready' && <ExportBar presets={sizePresets} />}
    </div>
  )
}

function PreviewContent({
  url,
  format,
  wordCount,
}: {
  url: string
  format: 'png' | 'svg'
  wordCount: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  // 用 ref 持有最新 zoom（性能优先，wheel/mousemove 高频事件不触发 React 重渲染）
  const zoomRef = useRef<ZoomState>({ ...INITIAL_ZOOM })
  // 用 state 同步给 UI（百分比显示 + transform 应用）
  const [zoom, setZoom] = useState<ZoomState>({ ...INITIAL_ZOOM })
  const [isDragging, setIsDragging] = useState(false)

  // 拖动起点记录
  const dragStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null)

  // 预览重新生成时重置 zoom
  useEffect(() => {
    zoomRef.current = { ...INITIAL_ZOOM }
    setZoom({ ...INITIAL_ZOOM })
  }, [url])

  // 应用变换到 img（直接操作 DOM 避免 React 重渲染卡顿）
  const applyTransform = useCallback(() => {
    const img = imgRef.current
    if (!img) return
    const { scale, tx, ty } = zoomRef.current
    img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`
  }, [])

  // 滚轮缩放（pin-to-mouse）：鼠标下的点在缩放前后保持不动
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()

      const container = containerRef.current
      const img = imgRef.current
      if (!container || !img) return

      const rect = container.getBoundingClientRect()
      // 鼠标相对容器中心的位置（容器中心为变换原点）
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const mouseX = e.clientX - rect.left - centerX
      const mouseY = e.clientY - rect.top - centerY

      const oldZoom = zoomRef.current
      // deltaY > 0（向下滚）→ 缩小；< 0（向上滚）→ 放大
      const factor = Math.exp(-e.deltaY * WHEEL_STEP)
      const newScale = clamp(oldZoom.scale * factor, MIN_SCALE, MAX_SCALE)
      const realFactor = newScale / oldZoom.scale

      // pin-to-mouse 公式：
      //   new_tx = mouseX - (mouseX - old_tx) * realFactor
      //   使鼠标下点（相对中心）在缩放后仍位于鼠标下
      const newTx = mouseX - (mouseX - oldZoom.tx) * realFactor
      const newTy = mouseY - (mouseY - oldZoom.ty) * realFactor

      zoomRef.current = { scale: newScale, tx: newTx, ty: newTy }
      applyTransform()
      setZoom(zoomRef.current)
    },
    [applyTransform],
  )

  // 拖动平移：mousedown 记起点
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // 仅左键拖动
    if (e.button !== 0) return
    e.preventDefault()
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      tx: zoomRef.current.tx,
      ty: zoomRef.current.ty,
    }
    setIsDragging(true)
  }, [])

  // 拖动平移：mousemove / mouseup 挂 document 级，避免移出容器后丢失
  useEffect(() => {
    if (!isDragging) return

    const handleMove = (e: MouseEvent) => {
      if (!dragStart.current) return
      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y
      zoomRef.current = {
        ...zoomRef.current,
        tx: dragStart.current.tx + dx,
        ty: dragStart.current.ty + dy,
      }
      applyTransform()
      setZoom(zoomRef.current)
    }

    const handleUp = () => {
      dragStart.current = null
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }
  }, [isDragging, applyTransform])

  // 缩放按钮：以容器中心为锚点缩放
  const zoomBy = useCallback(
    (factor: number) => {
      const oldZoom = zoomRef.current
      const newScale = clamp(oldZoom.scale * factor, MIN_SCALE, MAX_SCALE)
      zoomRef.current = { ...oldZoom, scale: newScale }
      applyTransform()
      setZoom(zoomRef.current)
    },
    [applyTransform],
  )

  const resetZoom = useCallback(() => {
    zoomRef.current = { ...INITIAL_ZOOM }
    applyTransform()
    setZoom({ ...INITIAL_ZOOM })
  }, [applyTransform])

  const percent = Math.round(zoom.scale * 100)

  return (
    <div className="w-full h-full flex flex-col">
      {/* 画布容器：接收 wheel / drag */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onDoubleClick={resetZoom}
        className={cn(
          'flex-1 relative overflow-hidden flex items-center justify-center',
          'select-none',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
        )}
        role="application"
        aria-label="词云预览画布（滚轮缩放，拖动平移，双击重置）"
      >
        <img
          ref={imgRef}
          src={url}
          alt={`词云预览，共 ${wordCount} 个词`}
          role="img"
          draggable={false}
          className={cn(
            'max-w-full max-h-full object-contain rounded-md border border-border shadow-md',
            'pointer-events-none transition-transform-none',
            'origin-center',
          )}
          style={{ willChange: 'transform' }}
        />

        {/* 左下角缩放控件浮层 */}
        <div
          className={cn(
            'absolute bottom-4 left-4 z-20',
            'flex items-center gap-0.5',
            'bg-surface border border-border rounded-md shadow-md px-1 py-0.5',
          )}
        >
          <button
            onClick={() => zoomBy(1 / 1.2)}
            disabled={zoom.scale <= MIN_SCALE + 0.001}
            aria-label="缩小"
            title="缩小"
            className="h-7 w-7 flex items-center justify-center rounded-sm text-ink-muted hover:text-ink hover:bg-bg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Minus className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            onClick={resetZoom}
            aria-label={`重置缩放（当前 ${percent}%）`}
            title={`重置缩放（当前 ${percent}%）`}
            className="h-7 min-w-[3rem] px-2 flex items-center justify-center rounded-sm text-2xs font-mono text-ink-muted hover:text-ink hover:bg-bg transition-colors"
          >
            {percent}%
          </button>
          <button
            onClick={() => zoomBy(1.2)}
            disabled={zoom.scale >= MAX_SCALE - 0.001}
            aria-label="放大"
            title="放大"
            className="h-7 w-7 flex items-center justify-center rounded-sm text-ink-muted hover:text-ink hover:bg-bg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <div className="w-px h-4 bg-border mx-0.5" aria-hidden="true" />
          <button
            onClick={resetZoom}
            aria-label="重置视图"
            title="重置视图（双击画布亦可）"
            className="h-7 w-7 flex items-center justify-center rounded-sm text-ink-muted hover:text-ink hover:bg-bg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* 右下角格式提示 */}
        <div className="absolute bottom-4 right-4 z-10 text-2xs text-ink-faint bg-surface/80 backdrop-blur-sm px-2 py-1 rounded-md pointer-events-none">
          预览格式：{format.toUpperCase()}
        </div>
      </div>
    </div>
  )
}
