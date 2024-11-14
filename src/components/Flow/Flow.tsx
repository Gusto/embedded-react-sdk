import { Suspense, createContext, useContext } from 'react'
import { useMachine } from 'react-robot'
import { type Machine } from 'robot3'
import { OnEventType } from '@/components/Base'
import { Loading } from '@/components/Common'
import { EventType } from '@/shared/constants'
import { FlowContext, FlowContextInterface } from './useFlow'

type FlowProps = {
  machine: Machine<object, FlowContextInterface>
  onEvent: OnEventType<EventType, unknown>
}

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
          {current.context.component && <current.context.component />}
        </Suspense>
      </FlowContext.Provider>
    </>
  )
}
