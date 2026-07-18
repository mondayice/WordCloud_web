import { useAppStore } from '@/store/useAppStore'
import { FileDrop } from '@/components/ui/FileDrop'

export function StopwordsSection() {
  const customDict = useAppStore((s) => s.customDict)
  const extraStopwords = useAppStore((s) => s.extraStopwords)
  const setCustomDict = useAppStore((s) => s.setCustomDict)
  const setExtraStopwords = useAppStore((s) => s.setExtraStopwords)

  return (
    <section className="flex flex-col gap-3 p-4 border-b border-border">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
        高级（可选）
      </h3>

      {/* 自定义字典 */}
      <FileDrop
        label="jieba 自定义字典"
        accept={['.txt']}
        hint="每行：词 [词频] [词性]"
        currentFile={customDict}
        onFile={setCustomDict}
        onClear={() => setCustomDict(null)}
      />

      {/* 追加停用词 */}
      <div className="flex flex-col gap-1.5">
        <span className="text-2xs font-semibold uppercase tracking-wider text-ink-faint">
          追加停用词
        </span>
        <textarea
          value={extraStopwords}
          onChange={(e) => setExtraStopwords(e.target.value)}
          placeholder="每行一个停用词…"
          rows={3}
          className="w-full rounded-md bg-surface border border-border p-2 text-xs text-ink resize-y focus:border-accent focus:ring-2 focus:ring-accent/30"
          aria-label="追加停用词"
        />
      </div>
    </section>
  )
}
