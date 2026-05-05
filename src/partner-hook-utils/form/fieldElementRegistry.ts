import { createContext, useContext, useRef } from 'react'

/**
 * Per-form map of registered field `name` → DOM element. Populated by `useField`
 * via a ref callback, consumed by `composeSubmitHandler` to focus the visually
 * first invalid field across multiple composed forms.
 */
export interface FieldElementRegistry {
  register: (name: string, element: HTMLElement | null) => void
  get: (name: string) => HTMLElement | null
  names: () => string[]
}

function createFieldElementRegistry(): FieldElementRegistry {
  const elements = new Map<string, HTMLElement>()
  return {
    register(name, element) {
      if (element) {
        elements.set(name, element)
      } else {
        elements.delete(name)
      }
    },
    get(name) {
      return elements.get(name) ?? null
    },
    names() {
      return Array.from(elements.keys())
    },
  }
}

/**
 * Creates a stable `FieldElementRegistry` scoped to the caller's lifetime.
 * Intended to be called once per form hook (via `useHookFormInternals`).
 */
export function useFieldElementRegistry(): FieldElementRegistry {
  const ref = useRef<FieldElementRegistry | null>(null)
  if (ref.current === null) {
    ref.current = createFieldElementRegistry()
  }
  return ref.current
}

export const FieldElementRegistryContext = createContext<FieldElementRegistry | null>(null)

export function useFieldElementRegistryContext(): FieldElementRegistry | null {
  return useContext(FieldElementRegistryContext)
}
