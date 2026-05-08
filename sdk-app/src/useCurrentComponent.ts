import { createContext, useContext } from 'react'
import type { ComponentEntry } from './registry'
import type { EntityIds } from './useEntities'

export interface CurrentComponentValue {
  entry: ComponentEntry
  entities: EntityIds
}

export interface CurrentComponentRegistry {
  current: CurrentComponentValue | null
  register: (next: CurrentComponentValue) => void
  unregister: () => void
}

const noop = () => {
  // No provider mounted; no-op fallback.
}

export const CurrentComponentContext = createContext<CurrentComponentRegistry>({
  current: null,
  register: noop,
  unregister: noop,
})

export function useCurrentComponent(): CurrentComponentValue | null {
  return useContext(CurrentComponentContext).current
}

export function useCurrentComponentRegistry(): Pick<
  CurrentComponentRegistry,
  'register' | 'unregister'
> {
  const { register, unregister } = useContext(CurrentComponentContext)
  return { register, unregister }
}
