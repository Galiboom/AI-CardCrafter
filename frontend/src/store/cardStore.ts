import { create } from 'zustand'
import { defaultPayload, defaultTemplateId, templateMap } from '../data/templates'
import type { CardPayload, CardField, TemplateId } from '../types/card'

type GenerationStatus = 'idle' | 'streaming' | 'error'

interface CardState {
  prompt: string
  payload: CardPayload
  templateId: TemplateId
  generationStatus: GenerationStatus
  activeField?: CardField
  error?: string
  isExporting: boolean
  lastSavedAt?: string
  setPrompt: (prompt: string) => void
  setTemplateId: (templateId: TemplateId) => void
  updatePayload: (patch: Partial<CardPayload>) => void
  updateField: (field: CardField, value: string | string[]) => void
  setGenerating: (activeField?: CardField) => void
  setGenerated: (payload: CardPayload) => void
  setError: (message: string) => void
  clearError: () => void
  setExporting: (isExporting: boolean) => void
  hydrateDraft: (payload: CardPayload, templateId: TemplateId, prompt: string, savedAt?: string) => void
  markSaved: (savedAt: string) => void
}

export const useCardStore = create<CardState>((set) => ({
  prompt: '推荐一款颜值极高的白色防雨运动鞋，适合夜跑',
  payload: defaultPayload,
  templateId: defaultTemplateId,
  generationStatus: 'idle',
  isExporting: false,
  setPrompt: (prompt) => set({ prompt }),
  setTemplateId: (templateId) =>
    set((state) => {
      const nextDefault = templateMap[templateId].defaultPayload

      return {
        templateId,
        payload: {
          ...state.payload,
          themeColor: nextDefault.themeColor,
          emojiIcon: state.payload.emojiIcon || nextDefault.emojiIcon,
        },
      }
    }),
  updatePayload: (patch) =>
    set((state) => ({
      payload: {
        ...state.payload,
        ...patch,
        themeColor: {
          ...state.payload.themeColor,
          ...patch.themeColor,
        },
      },
    })),
  updateField: (field, value) =>
    set((state) => {
      if (field === 'themeColor.from') {
        return {
          payload: {
            ...state.payload,
            themeColor: { ...state.payload.themeColor, from: String(value) },
          },
        }
      }

      if (field === 'themeColor.to') {
        return {
          payload: {
            ...state.payload,
            themeColor: { ...state.payload.themeColor, to: String(value) },
          },
        }
      }

      return {
        payload: {
          ...state.payload,
          [field]: field === 'tags' ? value : String(value),
        },
      }
    }),
  setGenerating: (activeField) =>
    set({
      generationStatus: 'streaming',
      activeField,
      error: undefined,
    }),
  setGenerated: (payload) =>
    set({
      payload,
      generationStatus: 'idle',
      activeField: undefined,
      error: undefined,
    }),
  setError: (message) =>
    set({
      generationStatus: 'error',
      activeField: undefined,
      error: message,
    }),
  clearError: () => set({ error: undefined, generationStatus: 'idle' }),
  setExporting: (isExporting) => set({ isExporting }),
  hydrateDraft: (payload, templateId, prompt, savedAt) =>
    set({
      payload,
      templateId,
      prompt,
      lastSavedAt: savedAt,
    }),
  markSaved: (savedAt) => set({ lastSavedAt: savedAt }),
}))
