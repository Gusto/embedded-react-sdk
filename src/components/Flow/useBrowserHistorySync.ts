import { useCallback, useEffect, useRef } from 'react'

const HASH_PREFIX = '#step='

function parseStepFromHash(): string | null {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash
  if (!hash.startsWith(HASH_PREFIX)) return null
  return decodeURIComponent(hash.slice(HASH_PREFIX.length))
}

export interface HistorySyncReplaceTransition {
  from: string
  to: string
}

interface UseBrowserHistorySyncOptions {
  enabled: boolean
  currentStateName: string
  validStateNames: readonly string[]
  terminalStateNames: readonly string[]
  /**
   * Specific (from → to) transitions that should write history with
   * replaceState instead of pushState. Use this to make a "success destination"
   * unreachable via the browser back button, e.g. a creation flow that lands
   * on a detail view where backing into the empty form would be confusing.
   * `terminalStateNames` is the coarser version — mark a whole state terminal
   * regardless of how it was entered.
   */
  replaceStateTransitions?: readonly HistorySyncReplaceTransition[]
  onNavigate: (stateName: string) => void
}

/**
 * Bidirectionally syncs a Flow's current state name with the browser URL hash
 * (`#step=<name>`). Forward transitions push a new history entry; terminal
 * states use replaceState. Back/forward button presses dispatch the SDK-side
 * navigation callback so the machine follows the URL.
 *
 * When `enabled` is false, the hook is a no-op — no listener is registered and
 * no history mutation occurs. Hook is always called to satisfy rules of hooks.
 */
export function useBrowserHistorySync({
  enabled,
  currentStateName,
  validStateNames,
  terminalStateNames,
  replaceStateTransitions,
  onNavigate,
}: UseBrowserHistorySyncOptions) {
  const validSetRef = useRef<Set<string>>(new Set(validStateNames))
  validSetRef.current = new Set(validStateNames)

  const terminalSetRef = useRef<Set<string>>(new Set(terminalStateNames))
  terminalSetRef.current = new Set(terminalStateNames)

  const replaceTransitionSetRef = useRef<Set<string>>(
    new Set((replaceStateTransitions ?? []).map(t => `${t.from}->${t.to}`)),
  )
  replaceTransitionSetRef.current = new Set(
    (replaceStateTransitions ?? []).map(t => `${t.from}->${t.to}`),
  )

  const onNavigateRef = useRef(onNavigate)
  onNavigateRef.current = onNavigate

  const suppressNextWriteRef = useRef(false)
  const lastWrittenRef = useRef<string | null>(null)

  const navigateIfValid = useCallback((target: string | null, currentName: string) => {
    if (!target) return false
    if (!validSetRef.current.has(target)) return false
    if (target === currentName) return false
    suppressNextWriteRef.current = true
    onNavigateRef.current(target)
    return true
  }, [])

  // Mount: honor deep link, or stamp the entry with current step.
  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined') return
    const initialStep = parseStepFromHash()
    if (initialStep && validSetRef.current.has(initialStep)) {
      if (initialStep !== currentStateName) {
        navigateIfValid(initialStep, currentStateName)
      } else {
        lastWrittenRef.current = currentStateName
      }
      return
    }
    if (validSetRef.current.has(currentStateName)) {
      window.history.replaceState(
        { sdkStep: currentStateName },
        '',
        `${HASH_PREFIX}${encodeURIComponent(currentStateName)}`,
      )
      lastWrittenRef.current = currentStateName
    }
    // Mount-only effect. Intentionally not depending on currentStateName —
    // subsequent state changes are handled by the write effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  // popstate: read the hash, navigate the machine to follow.
  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined') return
    const handler = () => {
      const step = parseStepFromHash()
      navigateIfValid(step, currentStateName)
    }
    window.addEventListener('popstate', handler)
    return () => {
      window.removeEventListener('popstate', handler)
    }
  }, [enabled, currentStateName, navigateIfValid])

  // State change → write the hash. Suppress when the change came from us.
  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined') return
    if (!validSetRef.current.has(currentStateName)) return
    if (suppressNextWriteRef.current) {
      suppressNextWriteRef.current = false
      lastWrittenRef.current = currentStateName
      return
    }
    const previous = lastWrittenRef.current
    if (previous === currentStateName) return
    const newHash = `${HASH_PREFIX}${encodeURIComponent(currentStateName)}`
    const transitionKey = previous ? `${previous}->${currentStateName}` : null
    const shouldReplace =
      terminalSetRef.current.has(currentStateName) ||
      (transitionKey !== null && replaceTransitionSetRef.current.has(transitionKey))
    if (shouldReplace) {
      window.history.replaceState({ sdkStep: currentStateName }, '', newHash)
    } else {
      window.history.pushState({ sdkStep: currentStateName }, '', newHash)
    }
    lastWrittenRef.current = currentStateName
  }, [enabled, currentStateName])
}
