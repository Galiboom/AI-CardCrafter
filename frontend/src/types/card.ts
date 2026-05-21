export interface CardPayload {
  title: string
  subtitle?: string
  content: string
  tags: string[]
  themeColor: {
    from: string
    to: string
  }
  emojiIcon: string
}

export type TemplateId = 'xiaohongshu' | 'tech' | 'commerce'

export interface CardDraft {
  payload: CardPayload
  templateId: TemplateId
  prompt: string
  savedAt: string
}

export type CardField = keyof CardPayload | 'themeColor.from' | 'themeColor.to'

export interface GenerateRequest {
  prompt: string
  templateId: TemplateId
}

export interface StreamPatchEvent {
  type: 'patch'
  field: CardField
  value: string | string[]
}

export interface StreamFinalEvent {
  type: 'final'
  payload: CardPayload
}

export interface StreamErrorEvent {
  type: 'error'
  message: string
}

export type StreamEvent = StreamPatchEvent | StreamFinalEvent | StreamErrorEvent
