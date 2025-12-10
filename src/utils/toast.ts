import { ref, createApp, h } from 'vue'

interface ToastItem {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

const toasts = ref<ToastItem[]>([])
let toastId = 0
let containerMounted = false

const iconMap: Record<string, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ'
}

const createContainer = () => {
  if (containerMounted) return
  
  const container = document.createElement('div')
  container.id = 'toast-container'
  container.style.cssText = `
    position: fixed;
    top: 1.5rem;
    right: 1.5rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    pointer-events: none;
  `
  document.body.appendChild(container)
  containerMounted = true
}

const renderToast = (toast: ToastItem) => {
  createContainer()
  const container = document.getElementById('toast-container')!
  
  const toastEl = document.createElement('div')
  toastEl.className = `toast toast-${toast.type}`
  toastEl.style.cssText = `
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1.25rem;
    min-width: 280px;
    max-width: 420px;
    background: linear-gradient(145deg, #1a1a24 0%, #12121a 100%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
    font-family: 'Noto Sans SC', sans-serif;
    animation: slideIn 0.3s ease-out;
    pointer-events: auto;
  `
  
  const colors: Record<string, string> = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  }
  
  toastEl.innerHTML = `
    <span style="
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: 0.75rem;
      font-weight: 700;
      background: ${colors[toast.type]}33;
      color: ${colors[toast.type]};
    ">${iconMap[toast.type]}</span>
    <span style="
      flex: 1;
      font-size: 0.9rem;
      color: #e4e4e7;
      line-height: 1.4;
    ">${toast.message}</span>
  `
  
  container.appendChild(toastEl)
  
  return toastEl
}

const removeToast = (el: HTMLElement) => {
  el.style.animation = 'slideOut 0.2s ease-in forwards'
  setTimeout(() => el.remove(), 200)
}

const addToast = (type: ToastItem['type'], message: string, duration = 3000) => {
  const id = ++toastId
  const el = renderToast({ id, type, message })
  
  if (duration > 0) {
    setTimeout(() => removeToast(el), duration)
  }
}

// 添加动画样式
const addStyles = () => {
  if (document.getElementById('toast-styles')) return
  
  const style = document.createElement('style')
  style.id = 'toast-styles'
  style.textContent = `
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideOut {
      from { opacity: 1; transform: translateX(0); }
      to { opacity: 0; transform: translateX(100%); }
    }
  `
  document.head.appendChild(style)
}

addStyles()

export const toast = {
  success: (msg: string, duration?: number) => addToast('success', msg, duration),
  error: (msg: string, duration?: number) => addToast('error', msg, duration),
  warning: (msg: string, duration?: number) => addToast('warning', msg, duration),
  info: (msg: string, duration?: number) => addToast('info', msg, duration)
}

export default toast
