import { Download, Loader2, Sparkles, WandSparkles } from 'lucide-react'
import { memo, useMemo } from 'react'
import { gradientPresets, templates } from '../data/templates'
import { streamCardGeneration } from '../services/cardApi'
import { useCardStore } from '../store/cardStore'
import { cn } from '../lib/utils'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'

interface ControlPanelProps {
  onExport: () => Promise<void>
}

function ControlPanelComponent({ onExport }: ControlPanelProps) {
  const prompt = useCardStore((state) => state.prompt)
  const payload = useCardStore((state) => state.payload)
  const templateId = useCardStore((state) => state.templateId)
  const generationStatus = useCardStore((state) => state.generationStatus)
  const isExporting = useCardStore((state) => state.isExporting)
  const error = useCardStore((state) => state.error)
  const lastSavedAt = useCardStore((state) => state.lastSavedAt)
  const setPrompt = useCardStore((state) => state.setPrompt)
  const setTemplateId = useCardStore((state) => state.setTemplateId)
  const updateField = useCardStore((state) => state.updateField)
  const setGenerating = useCardStore((state) => state.setGenerating)
  const setGenerated = useCardStore((state) => state.setGenerated)
  const setError = useCardStore((state) => state.setError)
  const isGenerating = generationStatus === 'streaming'

  const savedLabel = useMemo(() => {
    if (!lastSavedAt) {
      return '草稿等待保存'
    }

    return `已暂存 ${new Date(lastSavedAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })}`
  }, [lastSavedAt])

  async function handleGenerate() {
    if (isGenerating) {
      return
    }

    try {
      setGenerating('content')
      await streamCardGeneration(
        { prompt, templateId },
        {
          onPatch: (event) => {
            setGenerating(event.field)
            updateField(event.field, event.value)
          },
          onFinal: (nextPayload) => setGenerated(nextPayload),
          onError: (message) => setError(message),
        },
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请稍后再试。')
    }
  }

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-slate-200 bg-white/92 shadow-sm backdrop-blur xl:w-[390px]">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-slate-950">AI-CardCrafter</h1>
            <p className="text-xs text-slate-500">智能营销卡片生成器</p>
          </div>
        </div>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div className="space-y-5">
          <section className="space-y-2">
            <Label htmlFor="prompt">AI 提示词</Label>
            <Textarea
              id="prompt"
              className="min-h-32"
              value={prompt}
              disabled={isGenerating}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="输入商品卖点、营销痛点或内容方向"
            />
            <Button
              className="h-11 w-full"
              disabled={isGenerating || prompt.trim().length === 0}
              onClick={handleGenerate}
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
              {isGenerating ? '智能生成中' : '智能生成'}
            </Button>
          </section>

          <section className="space-y-3">
            <Label>风格模板</Label>
            <div className="grid grid-cols-3 gap-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  disabled={isGenerating}
                  onClick={() => setTemplateId(template.id)}
                  className={cn(
                    'group overflow-hidden rounded-md border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60',
                    templateId === template.id ? 'border-slate-950 ring-2 ring-slate-950/10' : 'border-slate-200',
                  )}
                >
                  <span className={cn('block h-12 bg-gradient-to-br', template.previewClass)} />
                  <span className="block px-2.5 py-2">
                    <span className="block text-sm font-bold text-slate-900">{template.shortName}</span>
                    <span className="mt-1 block text-[11px] leading-4 text-slate-500">{template.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <TextField
            id="title"
            label="标题"
            value={payload.title}
            maxLength={15}
            onChange={(value) => updateField('title', value)}
          />
          <TextField
            id="subtitle"
            label="副标题"
            value={payload.subtitle ?? ''}
            onChange={(value) => updateField('subtitle', value)}
          />
          <section className="space-y-2">
            <Label htmlFor="content">正文</Label>
            <Textarea
              id="content"
              value={payload.content}
              onChange={(event) => updateField('content', event.target.value)}
            />
          </section>
          <TextField
            id="tags"
            label="标签组"
            value={payload.tags.join('、')}
            onChange={(value) =>
              updateField(
                'tags',
                value
                  .split(/[、,，\n]/)
                  .map((tag) => tag.trim())
                  .filter(Boolean),
              )
            }
          />

          <section className="space-y-3">
            <Label>背景渐变</Label>
            <div className="grid grid-cols-3 gap-2">
              {gradientPresets.map((preset) => (
                <button
                  key={`${preset.from}-${preset.to}`}
                  type="button"
                  className="h-12 rounded-md border border-white shadow-sm ring-1 ring-slate-200 transition hover:scale-[1.02]"
                  style={{
                    background: `linear-gradient(135deg, ${preset.from}, ${preset.to})`,
                  }}
                  title={preset.name}
                  onClick={() => {
                    updateField('themeColor.from', preset.from)
                    updateField('themeColor.to', preset.to)
                  }}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ColorInput
                label="起始色"
                value={payload.themeColor.from}
                onChange={(value) => updateField('themeColor.from', value)}
              />
              <ColorInput
                label="结束色"
                value={payload.themeColor.to}
                onChange={(value) => updateField('themeColor.to', value)}
              />
            </div>
          </section>

          <TextField
            id="emoji"
            label="Emoji 图标"
            value={payload.emojiIcon}
            maxLength={4}
            onChange={(value) => updateField('emojiIcon', value)}
          />

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm leading-6 text-red-700">
              {error}
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-slate-200 px-5 py-4">
        <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
          <span>{savedLabel}</span>
          <span>IndexedDB</span>
        </div>
        <Button
          variant="secondary"
          className="h-11 w-full"
          disabled={isExporting}
          onClick={onExport}
        >
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {isExporting ? '导出中' : '导出高清图片'}
        </Button>
      </div>
    </aside>
  )
}

function TextField({
  id,
  label,
  value,
  maxLength,
  onChange,
}: {
  id: string
  label: string
  value: string
  maxLength?: number
  onChange: (value: string) => void
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {maxLength ? <span className="text-xs text-slate-400">{value.length}/{maxLength}</span> : null}
      </div>
      <Input
        id={id}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
      />
    </section>
  )
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-2 shadow-sm">
      <span
        className="h-7 w-7 shrink-0 rounded-md border border-white shadow-sm ring-1 ring-slate-200"
        style={{ background: value }}
      />
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold text-slate-500">{label}</span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="block w-full min-w-0 bg-transparent text-xs font-medium text-slate-800 outline-none"
        />
      </span>
    </label>
  )
}

export const ControlPanel = memo(ControlPanelComponent)
