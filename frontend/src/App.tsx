import { useEffect, useRef } from 'react'
import { ControlPanel } from './components/ControlPanel'
import { LivePreview } from './components/LivePreview'
import { loadDraft, saveDraft } from './lib/draftStorage'
import { exportCardNode } from './services/exportCard'
import { useCardStore } from './store/cardStore'

function App() {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const payload = useCardStore((state) => state.payload)
  const prompt = useCardStore((state) => state.prompt)
  const templateId = useCardStore((state) => state.templateId)
  const hydrateDraft = useCardStore((state) => state.hydrateDraft)
  const markSaved = useCardStore((state) => state.markSaved)
  const setExporting = useCardStore((state) => state.setExporting)

  useEffect(() => {
    let cancelled = false

    loadDraft()
      .then((draft) => {
        if (!cancelled && draft) {
          hydrateDraft(draft.payload, draft.templateId, draft.prompt, draft.savedAt)
        }
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [hydrateDraft])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedAt = new Date().toISOString()

      saveDraft({
        payload,
        prompt,
        templateId,
        savedAt,
      })
        .then(() => markSaved(savedAt))
        .catch(() => undefined)
    }, 2000)

    return () => window.clearTimeout(timer)
  }, [payload, prompt, templateId, markSaved])

  async function handleExport() {
    if (!cardRef.current) {
      return
    }

    setExporting(true)
    try {
      await exportCardNode(cardRef.current)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex h-screen min-h-[720px] overflow-hidden bg-[#eef1f6] text-slate-950 max-xl:h-auto max-xl:min-h-screen max-xl:flex-col max-xl:overflow-auto">
      <ControlPanel onExport={handleExport} />
      <LivePreview cardRef={cardRef} />
    </div>
  )
}

export default App
