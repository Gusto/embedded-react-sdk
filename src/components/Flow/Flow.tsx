import { useMachine } from 'react-robot'
import { type Machine, type SendFunction } from 'robot3'
import type { OnEventType } from '../Base/useBase'
import { Flex } from '../Common/Flex'
import type { FlowContextInterface } from './useFlow'
import { FlowContext } from './useFlow'
import { FlowHeader } from './FlowHeader'
import { type EventType } from '@/shared/constants'

type FlowProps<M extends Machine> = {
  machine: M
  onEvent: OnEventType<EventType, unknown>
}

export const Flow = <M extends Machine<object, FlowContextInterface>>({
  onEvent,
  machine,
}: FlowProps<M>) => {
  const [current, send, service] = useMachine(machine, {
    onEvent: handleEvent,
    component: null,
  })

  function handleEvent(type: EventType, data: unknown): void {
    const event = { type, payload: data }
    const sendFn = send as SendFunction<string>
    //When dealing with nested state machine, correct machine needs to recieve an event
    if (service.child) {
      ;(service.child.send as SendFunction<string>)(event)
    } else {
      sendFn(event)
    }
    // Pass event upstream - onEvent can be optional on Flow component
    onEvent(type, data)
  }

  const Component = current.context.component

  return (
    <Flex>
      <FlowContext.Provider
        value={{
          ...current.context,
        }}
      >
        <Flex flexDirection="column" gap={32}>
          <FlowHeader />
          {Component && <Component />}
        </Flex>
      </FlowContext.Provider>
    </Flex>
  )
}
