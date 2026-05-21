import type { CardField, CardPayload, StreamEvent } from '../types/card'

export function parseSseChunk(buffer: string) {
  const events: StreamEvent[] = []
  const parts = buffer.split('\n\n')
  const rest = parts.pop() ?? ''

  for (const part of parts) {
    const dataLines = part
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart())

    if (dataLines.length === 0) {
      continue
    }

    const raw = dataLines.join('\n')

    if (raw === '[DONE]') {
      continue
    }

    try {
      events.push(JSON.parse(raw) as StreamEvent)
    } catch {
      events.push(...partialToEvents(recoverPartialPayload(raw)))
    }
  }

  return { events, rest }
}

function partialToEvents(partial: Partial<CardPayload>): StreamEvent[] {
  const events: StreamEvent[] = []

  for (const field of ['title', 'subtitle', 'content', 'tags', 'emojiIcon'] as CardField[]) {
    const value = partial[field as keyof CardPayload]
    if (typeof value === 'string' || Array.isArray(value)) {
      events.push({ type: 'patch', field, value })
    }
  }

  if (partial.themeColor?.from) {
    events.push({ type: 'patch', field: 'themeColor.from', value: partial.themeColor.from })
  }

  if (partial.themeColor?.to) {
    events.push({ type: 'patch', field: 'themeColor.to', value: partial.themeColor.to })
  }

  return events
}

export function recoverPartialPayload(source: string) {
  const partial: Partial<CardPayload> = {}
  const stringFields = ['title', 'subtitle', 'content', 'emojiIcon'] as const

  for (const field of stringFields) {
    const value = extractJsonString(source, field)
    if (value !== undefined) {
      partial[field] = value
    }
  }

  const tags = extractStringArray(source, 'tags')
  if (tags.length > 0) {
    partial.tags = tags
  }

  const themeFrom = extractJsonString(source, 'from')
  const themeTo = extractJsonString(source, 'to')

  if (themeFrom || themeTo) {
    partial.themeColor = {
      from: themeFrom ?? '',
      to: themeTo ?? '',
    }
  }

  return partial
}

export function validatePayload(value: unknown): value is CardPayload {
  const payload = value as CardPayload

  return (
    Boolean(payload) &&
    typeof payload.title === 'string' &&
    payload.title.length > 0 &&
    payload.title.length <= 15 &&
    typeof payload.content === 'string' &&
    Array.isArray(payload.tags) &&
    payload.tags.every((tag) => typeof tag === 'string') &&
    typeof payload.themeColor?.from === 'string' &&
    typeof payload.themeColor?.to === 'string' &&
    typeof payload.emojiIcon === 'string'
  )
}

function extractJsonString(source: string, field: string) {
  const match = source.match(new RegExp(`"${field}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)`))

  if (!match?.[1]) {
    return undefined
  }

  return unescapeJsonString(match[1])
}

function extractStringArray(source: string, field: string) {
  const match = source.match(new RegExp(`"${field}"\\s*:\\s*\\[([^\\]]*)`))
  if (!match?.[1]) {
    return []
  }

  return Array.from(match[1].matchAll(/"((?:\\.|[^"\\])*)"/g)).map((item) =>
    unescapeJsonString(item[1]),
  )
}

function unescapeJsonString(value: string) {
  try {
    return JSON.parse(`"${value.replace(/"$/, '')}"`) as string
  } catch {
    return value.replace(/\\"/g, '"').replace(/\\\\/g, '\\')
  }
}
