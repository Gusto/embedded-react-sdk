import { Suspense, createContext, useContext } from 'react'
import { useMachine } from 'react-robot'
import { type Machine } from 'robot3'
import { OnEventType } from '@/components/Base'
import { Loading } from '@/components/Common'
import { type EventType } from '@/shared/constants'
import { Breadcrumb, Breadcrumbs, Link } from 'react-aria-components'

type FlowProps = {
  machine: Machine<object, FlowContextInterface>
  onEvent: OnEventType<EventType, unknown>
}

export interface FlowContextInterface {
  component: React.ComponentType | null
  onEvent: OnEventType<EventType, unknown>
  title?: string
}

const FlowContext = createContext<FlowContextInterface | null>(null)

export const Flow = ({ onEvent, machine }: FlowProps) => {
  const [current, send] = useMachine(machine, {
    onEvent: handleEvent,
    component: null,
  })

  function handleEvent(type: EventType, data: unknown): void {
     
    send({ type: type, payload: data })
    // Pass event upstream - onEvent can be optional on Flow component
    onEvent(type, data)
  }

  return (
    <>
      <FlowContext.Provider
        value={{
          ...current.context,
        }}
      >
        <Suspense fallback={<Loading />}>
          {current.context.title && (
            <Breadcrumbs>
              <Breadcrumb>
                <Link href="/">Timeline</Link>
              </Breadcrumb>
              <Breadcrumb>
                <Link>{current.context.title}</Link>
              </Breadcrumb>
            </Breadcrumbs>
          )}
          {current.context.component && <current.context.component />}
        </Suspense>
      </FlowContext.Provider>
    </>
  )
}

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
