import localforage from 'localforage'
import type { CardDraft } from '../types/card'

const DRAFT_KEY = 'ai-card-crafter:last-draft'

localforage.config({
  name: 'AI-CardCrafter',
  storeName: 'card_drafts',
  description: 'Local marketing card drafts',
})

export async function loadDraft() {
  return localforage.getItem<CardDraft>(DRAFT_KEY)
}

export async function saveDraft(draft: CardDraft) {
  await localforage.setItem(DRAFT_KEY, draft)
}
