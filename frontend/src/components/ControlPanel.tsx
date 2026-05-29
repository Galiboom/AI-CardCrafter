import {
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Palette,
  Save,
  Sparkles,
  WandSparkles,
} from 'lucide-react'
import { memo, useMemo } from 'react'
import { gradientPresets, templates } from '../data/templates'
import { cn } from '../lib/utils'
import { streamCardGeneration } from '../services/cardApi'
import { useCardStore } from '../store/cardStore'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'

interface ControlPanelProps {
  onExport: () => Promise<void>
}

const promptExamples = [
  '推荐一款适合夜跑的白色防雨运动鞋，突出颜值和安全感',
  '给咖啡店开业活动做一张小红书风格促销卡片',
  '为一个 AI 效率工具生成科技感发布海报文案',
]

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
  const activeTemplate = templates.find((template) => template.id === templateId) ?? templates[0]

  const completion = useMemo(() => {
    const checks = [
      payload.title.trim(),
      payload.subtitle?.trim(),
      payload.content.trim(),
      payload.tags.length > 0,
      payload.themeColor.from,
      payload.themeColor.to,
      payload.emojiIcon.trim(),
    ]

    return Math.round((checks.filter(Boolean).length / checks.length) * 100)
  }, [payload])

  const savedLabel = useMemo(() => {
    if (!lastSavedAt) {
      return '等待自动暂存'
    }

    return new Date(lastSavedAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
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
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-slate-200 bg-white/95 shadow-sm backdrop-blur xl:w-[410px]">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-tight text-slate-950">AI-CardCrafter</h1>
              <p className="mt-1 text-xs text-slate-500">智能营销卡片生成器</p>
            </div>
          </div>
          <div className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
            Live
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Metric label="模板" value={activeTemplate.shortName} />
          <Metric label="完整度" value={`${completion}%`} />
          <Metric label="标签" value={`${payload.tags.length}`} />
        </div>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div className="space-y-5">
          <section className="space-y-3 rounded-md border border-slate-200 bg-slate-50/80 p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <Label htmlFor="prompt">AI 提示词</Label>
              <span className="text-xs font-medium text-slate-400">{prompt.length}/1200</span>
            </div>
            <Textarea
              id="prompt"
              className="min-h-32 border-slate-200 bg-white"
              value={prompt}
              disabled={isGenerating}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="输入商品卖点、营销痛点或内容方向"
            />
            <div className="flex gap-2 overflow-x-auto pb-1">
              {promptExamples.map((example) => (
                <button
                  key={example}
                  type="button"
                  disabled={isGenerating}
                  onClick={() => setPrompt(example)}
                  className="shrink-0 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-950 disabled:opacity-50"
                >
                  {example.slice(0, 16)}...
                </button>
              ))}
            </div>
            <Button
              className="h-11 w-full"
              disabled={isGenerating || prompt.trim().length === 0}
              onClick={handleGenerate}
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
              {isGenerating ? '智能生成中' : '智能生成卡片'}
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
                  <span className={cn('relative block h-12 bg-gradient-to-br', template.previewClass)}>
                    {templateId === template.id ? (
                      <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-white text-slate-950 shadow-sm">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
                    ) : null}
                  </span>
                  <span className="block px-2.5 py-2">
                    <span className="block text-sm font-bold text-slate-900">{template.shortName}</span>
                    <span className="mt-1 block text-[11px] leading-4 text-slate-500">{template.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <PanelGroup icon={<FileText className="h-4 w-4" />} title="文案微调">
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
                className="min-h-28"
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
          </PanelGroup>

          <PanelGroup icon={<Palette className="h-4 w-4" />} title="视觉设置">
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
          </PanelGroup>

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm leading-6 text-red-700">
              {error}
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white px-5 py-4">
        <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Save className="h-3.5 w-3.5" />
            {lastSavedAt ? `已暂存 ${savedLabel}` : savedLabel}
          </span>
          <span className="font-semibold text-slate-400">IndexedDB</span>
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <span className="block text-[11px] font-semibold text-slate-400">{label}</span>
      <strong className="mt-0.5 block truncate text-sm text-slate-950">{value}</strong>
    </div>
  )
}

function PanelGroup({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-slate-100 text-slate-600">{icon}</span>
        {title}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
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
