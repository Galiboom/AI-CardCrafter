import { memo } from 'react'
import { BadgePercent, CircleDollarSign, Cpu, Hash, Sparkles } from 'lucide-react'
import { useCardStore } from '../store/cardStore'
import { cn } from '../lib/utils'

interface LivePreviewProps {
  cardRef: React.RefObject<HTMLDivElement | null>
}

function LivePreviewComponent({ cardRef }: LivePreviewProps) {
  const payload = useCardStore((state) => state.payload)
  const templateId = useCardStore((state) => state.templateId)
  const generationStatus = useCardStore((state) => state.generationStatus)
  const activeField = useCardStore((state) => state.activeField)
  const isExporting = useCardStore((state) => state.isExporting)
  const isGenerating = generationStatus === 'streaming'

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-[#eef1f6]">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white/75 px-5 py-3 backdrop-blur">
        <div>
          <p className="text-sm font-bold text-slate-950">Live Preview Canvas</p>
          <p className="text-xs text-slate-500">4:3 marketing card, controlled by schema</p>
        </div>
        <div className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              isGenerating ? 'animate-pulse bg-emerald-500' : 'bg-slate-300',
            )}
          />
          {isGenerating ? 'AI streaming' : 'Ready'}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 place-items-center overflow-auto px-5 py-8">
        <div className="w-full max-w-[880px]">
          <div className="mx-auto aspect-[4/3] w-full">
            <article
              ref={cardRef}
              className={cn(
                'relative h-full w-full overflow-hidden rounded-[8px] text-white shadow-2xl ring-1 ring-black/10',
                isExporting && 'exporting-card',
              )}
              style={{
                background: `linear-gradient(135deg, ${payload.themeColor.from}, ${payload.themeColor.to})`,
              }}
            >
              {templateId === 'xiaohongshu' ? (
                <XiaohongshuCard payload={payload} activeField={activeField} isGenerating={isGenerating} />
              ) : null}
              {templateId === 'tech' ? (
                <TechCard payload={payload} activeField={activeField} isGenerating={isGenerating} />
              ) : null}
              {templateId === 'commerce' ? (
                <CommerceCard payload={payload} activeField={activeField} isGenerating={isGenerating} />
              ) : null}
            </article>
          </div>
        </div>
      </div>
    </main>
  )
}

function XiaohongshuCard({
  payload,
  activeField,
  isGenerating,
}: CardTemplateProps) {
  return (
    <div className="relative flex h-full flex-col justify-between p-[6%]">
      <div className="absolute left-[7%] top-[9%] h-20 w-20 rounded-full bg-white/20 blur-2xl" />
      <div className="absolute bottom-[8%] right-[7%] h-28 w-28 rounded-full bg-yellow-200/30 blur-3xl" />
      <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:26px_26px]" />
      <div className="relative">
        <div className="mb-5 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-rose-600 shadow-lg">
            <Sparkles className="h-4 w-4" />
            今日种草
          </span>
          <span className={fieldClass('emojiIcon', activeField, isGenerating, 'text-5xl')}>
            {payload.emojiIcon}
          </span>
        </div>
        <h2 className={fieldClass('title', activeField, isGenerating, 'max-w-[78%] text-6xl font-black leading-[1.02] tracking-normal drop-shadow-sm')}>
          {payload.title}
        </h2>
        <p className={fieldClass('subtitle', activeField, isGenerating, 'mt-4 inline-block rounded-md bg-black/18 px-4 py-2 text-2xl font-bold')}>
          {payload.subtitle}
        </p>
      </div>

      <div className="relative max-w-[82%]">
        <p className={fieldClass('content', activeField, isGenerating, 'text-2xl font-semibold leading-snug text-white/95')}>
          {payload.content}
        </p>
        <TagRow tags={payload.tags} activeField={activeField} isGenerating={isGenerating} />
      </div>
    </div>
  )
}

function TechCard({ payload, activeField, isGenerating }: CardTemplateProps) {
  return (
    <div className="relative h-full p-[6%]">
      <div className="absolute inset-0 bg-slate-950/70" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.22)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <div className="mb-10 flex items-center justify-between border-b border-white/20 pb-4">
            <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-cyan-100">
              <Cpu className="h-5 w-5" />
              Product Signal
            </span>
            <span className={fieldClass('emojiIcon', activeField, isGenerating, 'text-5xl')}>
              {payload.emojiIcon}
            </span>
          </div>
          <h2 className={fieldClass('title', activeField, isGenerating, 'max-w-[84%] text-6xl font-black leading-none tracking-normal')}>
            {payload.title}
          </h2>
          <p className={fieldClass('subtitle', activeField, isGenerating, 'mt-5 max-w-[70%] text-2xl font-semibold text-cyan-100')}>
            {payload.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-[1fr_180px] gap-8">
          <p className={fieldClass('content', activeField, isGenerating, 'text-xl font-medium leading-relaxed text-slate-100')}>
            {payload.content}
          </p>
          <div className="rounded-md border border-white/20 bg-white/10 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-cyan-100">
              <Hash className="h-4 w-4" />
              TAGS
            </div>
            <TagRow tags={payload.tags} activeField={activeField} isGenerating={isGenerating} vertical />
          </div>
        </div>
      </div>
    </div>
  )
}

function CommerceCard({ payload, activeField, isGenerating }: CardTemplateProps) {
  return (
    <div className="relative flex h-full flex-col p-[5%]">
      <div className="absolute inset-x-[5%] top-[5%] h-[16%] rounded-md bg-white/95 shadow-xl" />
      <div className="absolute -bottom-[16%] -right-[8%] h-[58%] w-[46%] rounded-full bg-white/22" />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-center justify-between px-4 py-3 text-slate-950">
          <span className="inline-flex items-center gap-2 text-lg font-black">
            <BadgePercent className="h-5 w-5" />
            限时主推
          </span>
          <span className="rounded-md bg-slate-950 px-3 py-1 text-sm font-bold text-white">NEW ARRIVAL</span>
        </div>
        <div className="grid grid-cols-[1.1fr_.9fr] items-end gap-8">
          <div>
            <span className={fieldClass('emojiIcon', activeField, isGenerating, 'mb-4 block text-6xl')}>
              {payload.emojiIcon}
            </span>
            <h2 className={fieldClass('title', activeField, isGenerating, 'text-6xl font-black leading-[0.98] tracking-normal text-white drop-shadow-md')}>
              {payload.title}
            </h2>
            <p className={fieldClass('subtitle', activeField, isGenerating, 'mt-5 text-3xl font-black text-yellow-100')}>
              {payload.subtitle}
            </p>
          </div>
          <div className="rounded-md bg-white p-5 text-slate-950 shadow-2xl">
            <div className="mb-4 flex items-center gap-2 text-sm font-black text-red-500">
              <CircleDollarSign className="h-5 w-5" />
              SELLING POINT
            </div>
            <p className={fieldClass('content', activeField, isGenerating, 'text-xl font-bold leading-snug')}>
              {payload.content}
            </p>
            <TagRow tags={payload.tags} activeField={activeField} isGenerating={isGenerating} dark />
          </div>
        </div>
      </div>
    </div>
  )
}

interface CardTemplateProps {
  payload: {
    title: string
    subtitle?: string
    content: string
    tags: string[]
    emojiIcon: string
  }
  activeField?: string
  isGenerating: boolean
}

function TagRow({
  tags,
  activeField,
  isGenerating,
  vertical = false,
  dark = false,
}: {
  tags: string[]
  activeField?: string
  isGenerating: boolean
  vertical?: boolean
  dark?: boolean
}) {
  return (
    <div
      className={cn(
        fieldClass('tags', activeField, isGenerating, 'mt-6 flex gap-2'),
        vertical ? 'flex-col' : 'flex-wrap',
      )}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className={cn(
            'rounded-md px-3 py-1 text-sm font-black',
            dark ? 'bg-slate-100 text-slate-900' : 'bg-white/22 text-white ring-1 ring-white/20',
          )}
        >
          {tag}
        </span>
      ))}
    </div>
  )
}

function fieldClass(field: string, activeField: string | undefined, isGenerating: boolean, className: string) {
  return cn(className, isGenerating && activeField === field && 'is-streaming-field')
}

export const LivePreview = memo(LivePreviewComponent)
