import type { CardPayload, TemplateId } from '../types/card'

export interface TemplateDefinition {
  id: TemplateId
  name: string
  shortName: string
  description: string
  previewClass: string
  defaultPayload: CardPayload
}

export const gradientPresets = [
  { name: '玫瑰热卖', from: '#fb7185', to: '#f97316' },
  { name: '薄荷清透', from: '#10b981', to: '#06b6d4' },
  { name: '电光蓝紫', from: '#2563eb', to: '#7c3aed' },
  { name: '曜石金', from: '#111827', to: '#f59e0b' },
  { name: '荔枝粉', from: '#ec4899', to: '#f43f5e' },
  { name: '极夜青', from: '#0f172a', to: '#14b8a6' },
]

export const templates: TemplateDefinition[] = [
  {
    id: 'xiaohongshu',
    name: '小红书爆款风',
    shortName: '小红书',
    description: '强标题、贴纸感、适合种草封面',
    previewClass: 'from-rose-400 to-orange-400',
    defaultPayload: {
      title: '夜跑也要漂亮',
      subtitle: '白色防雨运动鞋',
      content: '轻盈防泼水鞋面，雨后路面也能稳稳迈开。反光细节提升夜间识别度，通勤、训练、拍照都很能打。',
      tags: ['#好物推荐', '#夜跑神器', '#白鞋穿搭'],
      themeColor: { from: '#fb7185', to: '#f97316' },
      emojiIcon: '✨',
    },
  },
  {
    id: 'tech',
    name: '科技极客风',
    shortName: '科技',
    description: '高对比、网格、适合 SaaS 和数码产品',
    previewClass: 'from-cyan-400 to-blue-700',
    defaultPayload: {
      title: '轻装夜行系统',
      subtitle: '全天候城市跑鞋',
      content: '防雨鞋面、稳定抓地、反光识别三项核心能力，把夜跑装备做成一套更可靠的城市移动方案。',
      tags: ['#UrbanRun', '#WaterReady', '#Reflective'],
      themeColor: { from: '#06b6d4', to: '#2563eb' },
      emojiIcon: '⚡',
    },
  },
  {
    id: 'commerce',
    name: '电商促销风',
    shortName: '电商',
    description: '明确利益点、价格感、适合商品主图',
    previewClass: 'from-amber-400 to-red-500',
    defaultPayload: {
      title: '防雨白鞋上新',
      subtitle: '夜跑通勤一双搞定',
      content: '高颜值白色鞋身，防泼水更省心。今晚下单解锁限时福利，让雨天运动也保持清爽利落。',
      tags: ['限时上新', '防泼水', '夜跑推荐'],
      themeColor: { from: '#f59e0b', to: '#ef4444' },
      emojiIcon: '🔥',
    },
  },
]

export const templateMap = templates.reduce(
  (acc, template) => {
    acc[template.id] = template
    return acc
  },
  {} as Record<TemplateId, TemplateDefinition>,
)

export const defaultTemplateId: TemplateId = 'xiaohongshu'

export const defaultPayload = templateMap[defaultTemplateId].defaultPayload
