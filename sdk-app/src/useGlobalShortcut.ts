import { useEffect } from 'react'

interface UseGlobalShortcutOptions {
  key: string
  onTrigger: (event: KeyboardEvent) => void
  enabled?: boolean
  /** When 'mod', requires Cmd on Mac or Ctrl on other platforms. */
  modifier?: 'mod'
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

export function useGlobalShortcut({
  key,
  onTrigger,
  enabled = true,
  modifier,
}: UseGlobalShortcutOptions) {
  useEffect(() => {
    if (!enabled) return
    const handler = (event: KeyboardEvent) => {
      if (modifier === 'mod') {
        const hasMod = event.metaKey || event.ctrlKey
        if (!hasMod || event.altKey) return
      } else {
        if (event.metaKey || event.ctrlKey || event.altKey) return
        if (isTypingTarget(event.target)) return
      }
      if (event.key !== key) return
      onTrigger(event)
    }
    document.addEventListener('keydown', handler)
    return () => {
      document.removeEventListener('keydown', handler)
    }
  }, [key, enabled, modifier, onTrigger])
}
