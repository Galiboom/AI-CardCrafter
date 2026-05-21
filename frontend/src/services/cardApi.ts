import { parseSseChunk, validatePayload } from '../lib/streamParser'
import type { CardPayload, GenerateRequest, StreamEvent } from '../types/card'

interface StreamHandlers {
  onPatch: (event: Extract<StreamEvent, { type: 'patch' }>) => void
  onFinal: (payload: CardPayload) => void
  onError: (message: string) => void
}

export async function streamCardGeneration(request: GenerateRequest, handlers: StreamHandlers) {
  const response = await fetch('/api/cards/generate/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok || !response.body) {
    const text = await response.text().catch(() => '')
    throw new Error(text || `生成接口请求失败：${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()

    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const parsed = parseSseChunk(buffer)
    buffer = parsed.rest

    for (const event of parsed.events) {
      if (event.type === 'patch') {
        handlers.onPatch(event)
      }

      if (event.type === 'final') {
        if (!validatePayload(event.payload)) {
          handlers.onError('AI 返回的数据结构不完整，请重试。')
          continue
        }

        handlers.onFinal(event.payload)
      }

      if (event.type === 'error') {
        handlers.onError(event.message)
      }
    }
  }
}
