import { useEffect } from 'react'

interface UseGlobalShortcutOptions {
  key: string
  onTrigger: (event: KeyboardEvent) => void
  enabled?: boolean
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (target.isContentEditable) return true
  const role = target.getAttribute('role')
  if (role === 'textbox' || role === 'combobox') return true
  return false
}

export function useGlobalShortcut({ key, onTrigger, enabled = true }: UseGlobalShortcutOptions) {
  useEffect(() => {
    if (!enabled) return
    const handler = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key !== key) return
      if (isTypingTarget(event.target)) return
      onTrigger(event)
    }
    document.addEventListener('keydown', handler)
    return () => {
      document.removeEventListener('keydown', handler)
    }
  }, [key, enabled, onTrigger])
}
