import { useState } from 'react'
import { BarChart3, ChevronDown, ChevronUp } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Button, Spinner } from '@/components/ui'
import { tokenize } from '@/lib/api'

export function FrequencyPanel() {
  const [expanded, setExpanded] = useState(false)
  const inputText = useAppStore((s) => s.inputText)
  const inputFile = useAppStore((s) => s.inputFile)
  const customDict = useAppStore((s) => s.customDict)
  const extraStopwords = useAppStore((s) => s.extraStopwords)
  const frequencies = useAppStore((s) => s.frequencies)
  const totalWords = useAppStore((s) => s.totalWords)
  const uniqueWords = useAppStore((s) => s.uniqueWords)
  const loadingStage = useAppStore((s) => s.loadingStage)
  const setFrequencies = useAppStore((s) => s.setFrequencies)
  const setLoadingStage = useAppStore((s) => s.setLoadingStage)
  const addToast = useAppStore((s) => s.addToast)

  const handleAnalyze = async () => {
    setLoadingStage('tokenizing')
    try {
      const result = await tokenize({
        text: inputText || undefined,
        file: inputFile || undefined,
        customDict: customDict || undefined,
        extraStopwords: extraStopwords || undefined,
      })
      setFrequencies(result.frequencies, result.total_words, result.unique_words)
      setExpanded(true)
      addToast({
        variant: 'success',
        title: '分词完成',
        description: `共 ${result.unique_words} 个不同词`,
      })
    } catch (e) {
      addToast({
        variant: 'error',
        title: '分词失败',
        description: e instanceof Error ? e.message : '未知错误',
      })
    } finally {
      setLoadingStage('idle')
    }
  }

  const top = frequencies.slice(0, 20)
  const maxCount = top[0]?.count ?? 1
  const isLoading = loadingStage === 'tokenizing'

  return (
    <section className="flex flex-col gap-2 p-4 border-b border-border">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-faint">
          <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
          词频统计
        </h3>
        {frequencies.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? '收起' : '展开'}
            className="text-ink-faint hover:text-ink"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={handleAnalyze}
        isLoading={isLoading}
        disabled={!inputText && !inputFile}
        leftIcon={
          !isLoading ? <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" /> : undefined
        }
      >
        分析词频
      </Button>

      {isLoading && (
        <div className="flex items-center gap-2 text-2xs text-ink-muted">
          <Spinner size="sm" label="分词中" />
          <span>分词中…</span>
        </div>
      )}

      {frequencies.length > 0 && expanded && (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-2xs text-ink-faint">
            <span>共 {uniqueWords} 个不同词</span>
            <span>{totalWords} 词次</span>
          </div>
          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
            {top.map((f, i) => (
              <div key={f.word} className="flex items-center gap-2">
                <span className="text-2xs text-ink-faint font-mono w-5 text-right">
                  {i + 1}
                </span>
                <span className="text-xs text-ink w-16 truncate">{f.word}</span>
                <div className="flex-1 h-3 bg-bg rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-accent/60"
                    style={{ width: `${(f.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="text-2xs text-ink-muted font-mono w-8 text-right">
                  {f.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
