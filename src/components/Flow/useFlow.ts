import { createContext, useContext } from 'react'
import type { OnEventType } from '../Base/Base'
import type { EventType } from '@/shared/constants'

export interface FlowContextInterface {
  component: React.ComponentType | null
  onEvent: OnEventType<EventType, unknown>
  title?: string
  defaultValues?: Record<string, unknown>
}

export const FlowContext = createContext<FlowContextInterface | null>(null)

//TODO: This is hiding the fact that the callsite for useFlow
//  destructures a `companyId` that doesn't seem to exist
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function useFlow<C extends FlowContextInterface>() {
  // When used outside provider, this is expected to return undefined - consumers must fallback to params
  const values = useContext<C>(FlowContext as unknown as React.Context<C>)
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!values) {
    throw new Error('useFlow used outside provider')
  }
  return values
}
