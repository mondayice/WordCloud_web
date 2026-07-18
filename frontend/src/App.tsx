import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { ToastContainer } from '@/components/ui/Toast'
import { InputSection } from '@/components/sidebar/InputSection'
import { ShapeSection } from '@/components/sidebar/ShapeSection'
import { StyleSection } from '@/components/sidebar/StyleSection'
import { SizeSection } from '@/components/sidebar/SizeSection'
import { StopwordsSection } from '@/components/sidebar/StopwordsSection'
import { FrequencyPanel } from '@/components/sidebar/FrequencyPanel'
import { WordCloudCanvas } from '@/components/canvas/WordCloudCanvas'
import { useAppStore } from '@/store/useAppStore'
import { useTheme } from '@/hooks/useTheme'
import { fetchConfig, generateWordCloud } from '@/lib/api'
import type { ConfigResponse } from '@/types/api'

export default function App() {
  const { preference, toggle } = useTheme()
  const [config, setConfig] = useState<ConfigResponse | null>(null)

  useEffect(() => {
    fetchConfig()
      .then(setConfig)
      .catch((e) => console.error('加载配置失败：', e))
  }, [])

  return (
    <>
      <AppShell
        header={
          <>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" aria-hidden="true" />
              <h1 className="text-sm font-semibold text-ink">WordCloud Studio</h1>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle preference={preference} onToggle={toggle} />
            </div>
          </>
        }
        sidebar={<SidebarContent config={config} />}
        canvas={
          <WordCloudCanvas sizePresets={config?.size_presets ?? []} />
        }
      />
      <ToastContainerToaster />
    </>
  )
}

function SidebarContent({ config }: { config: ConfigResponse | null }) {
  return (
    <div className="flex flex-col">
      <InputSection />
      {config && <ShapeSection shapes={config.shapes} />}
      {config && <StyleSection presetColorSchemes={config.color_schemes} />}
      {config && <SizeSection presets={config.size_presets} />}
      <FrequencyPanel />
      <StopwordsSection />
      <GenerateButton />
    </div>
  )
}

function GenerateButton() {
  const store = useAppStore()
  const addToast = useAppStore((s) => s.addToast)
  const setLoadingStage = useAppStore((s) => s.setLoadingStage)
  const setPreview = useAppStore((s) => s.setPreview)
  const setError = useAppStore((s) => s.setError)

  const handleGenerate = async () => {
    if (!store.inputText && !store.inputFile && store.frequencies.length === 0) {
      addToast({ variant: 'warning', title: '请先输入文本或分析词频' })
      return
    }

    setLoadingStage('rendering')
    setError(null)
    try {
      // 根据 selectedColor 类型解析配色来源（先取局部变量再 narrow）
      const selected = store.selectedColor
      const colorParams =
        selected.type === 'preset'
          ? { colorScheme: selected.key }
          : {
              colors: store.customColorSchemes.find((s) => s.key === selected.schemeId)
                ?.colors,
            }
      const { blob, format } = await generateWordCloud({
        frequencies: store.frequencies.length > 0 ? store.frequencies : undefined,
        text: store.frequencies.length === 0 ? store.inputText : undefined,
        file: store.frequencies.length === 0 ? store.inputFile ?? undefined : undefined,
        customDict: store.customDict ?? undefined,
        extraStopwords: store.extraStopwords || undefined,
        shape: store.shape,
        maskImage: store.maskImage ?? undefined,
        ...colorParams,
        backgroundColor: store.backgroundColor,
        width: store.sizePreset.width,
        height: store.sizePreset.height,
        rotationSteps: store.rotationSteps,
        fontCustomEnabled: store.fontCustomEnabled,
        minFontSize: store.minFontSize,
        maxFontSize: store.maxFontSize,
        format: 'png', // 预览固定 PNG
      })
      setPreview(blob, format)
      addToast({ variant: 'success', title: '词云生成成功' })
    } catch (e) {
      const msg = e instanceof Error ? e.message : '未知错误'
      setError(msg)
      addToast({ variant: 'error', title: '生成失败', description: msg })
    } finally {
      setLoadingStage('idle')
    }
  }

  return (
    <div className="p-4 sticky bottom-0 bg-surface border-t border-border">
      <Button
        variant="accent"
        size="lg"
        onClick={handleGenerate}
        isLoading={store.loadingStage === 'rendering'}
        className="w-full"
      >
        生成词云
      </Button>
    </div>
  )
}

function ToastContainerToaster() {
  const toasts = useAppStore((s) => s.toasts)
  const dismissToast = useAppStore((s) => s.dismissToast)
  return <ToastContainer toasts={toasts} onDismiss={dismissToast} />
}
