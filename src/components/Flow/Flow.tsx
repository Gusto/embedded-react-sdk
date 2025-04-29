import { Suspense } from 'react'
import { useMachine } from 'react-robot'
import { type Machine } from 'robot3'
import type { OnEventType } from '../Base/useBase'
import type { FlowContextInterface } from './useFlow'
import { FlowContext } from './useFlow'
import { Loading } from '@/components/Common'
import { type EventType } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

type FlowProps = {
  machine: Machine<object, FlowContextInterface>
  onEvent: OnEventType<EventType, unknown>
}

export const Flow = ({ onEvent, machine }: FlowProps) => {
  const Components = useComponentContext()
  const [current, send, service] = useMachine(machine, {
    onEvent: handleEvent,
    component: null,
  })

  function handleEvent(type: EventType, data: unknown): void {
    //When dealing with nested state machine, correct machine needs to recieve an event
    if (service.child) {
      //@ts-expect-error: not sure why 'type' type is incorrectly derived here
      service.child.send({ type: type, payload: data })
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      send({ type: type, payload: data })
    }
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
            <Components.Breadcrumbs
              crumbs={[
                { label: 'Timeline', href: '/' },
                { label: current.context.title, isCurrent: true },
              ]}
            />
          )}
          {current.context.component && <current.context.component />}
        </Suspense>
      </FlowContext.Provider>
    </>
  )
}
