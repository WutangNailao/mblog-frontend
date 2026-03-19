export type AppMessageType = 'success' | 'error' | 'warning' | 'info'

export interface AppMessageOptions {
  duration?: number
  onLeave?: () => void
}

let messageRoot: HTMLElement | null = null

const ensureMessageRoot = () => {
  if (typeof window === 'undefined') return null
  if (!messageRoot) {
    messageRoot = document.createElement('div')
    messageRoot.className = 'app-message-root'
    messageRoot.style.position = 'fixed'
    messageRoot.style.top = '1rem'
    messageRoot.style.left = '50%'
    messageRoot.style.transform = 'translateX(-50%)'
    messageRoot.style.zIndex = '9999'
    messageRoot.style.display = 'flex'
    messageRoot.style.flexDirection = 'column'
    messageRoot.style.gap = '0.5rem'
    document.body.appendChild(messageRoot)
  }
  return messageRoot
}

export const showAppMessage = (type: AppMessageType, content: string, options?: AppMessageOptions) => {
  const root = ensureMessageRoot()
  if (!root) return

  const el = document.createElement('div')
  const palette: Record<AppMessageType, { bg: string; border: string }> = {
    success: { bg: '#ecfdf5', border: '#10b981' },
    error: { bg: '#fef2f2', border: '#ef4444' },
    warning: { bg: '#fffbeb', border: '#f59e0b' },
    info: { bg: '#eff6ff', border: '#3b82f6' },
  }

  el.textContent = content
  el.style.padding = '0.75rem 1rem'
  el.style.border = `1px solid ${palette[type].border}`
  el.style.background = palette[type].bg
  el.style.color = '#1f2937'
  el.style.borderRadius = '0.5rem'
  el.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.08)'
  root.appendChild(el)

  const duration = options?.duration ?? 2000
  window.setTimeout(() => {
    el.remove()
    options?.onLeave?.()
  }, duration)
}

export const createAppMessage = () => ({
  success: (content: string, options?: AppMessageOptions) => showAppMessage('success', content, options),
  error: (content: string, options?: AppMessageOptions) => showAppMessage('error', content, options),
  warning: (content: string, options?: AppMessageOptions) => showAppMessage('warning', content, options),
  info: (content: string, options?: AppMessageOptions) => showAppMessage('info', content, options),
})
