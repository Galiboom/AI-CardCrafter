import { toPng } from 'html-to-image'

export async function exportCardNode(node: HTMLElement) {
  const scale = Math.max(2, Math.ceil(window.devicePixelRatio || 1) * 2)
  const rect = node.getBoundingClientRect()
  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: scale,
    width: rect.width,
    height: rect.height,
    canvasWidth: rect.width * scale,
    canvasHeight: rect.height * scale,
    style: {
      transform: 'none',
    },
    fetchRequestInit: {
      mode: 'cors',
    },
  })

  const link = document.createElement('a')
  link.download = `ai-card-crafter-${Date.now()}.png`
  link.href = dataUrl
  link.click()
}
