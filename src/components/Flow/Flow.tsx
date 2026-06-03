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

/**
 * Drives a robot3 state machine that orchestrates a multi-step SDK flow, rendering the active
 * step component inside a {@link FlowContext} provider with optional header chrome above it.
 *
 * @remarks
 * Re-emits every event produced by the state machine (or the active child machine, when one is
 * nested) to the upstream `onEvent` callback, so the consuming flow component (e.g. `PayrollFlow`,
 * `OnboardingFlow`) can forward them to partner code. The set of event types is defined by the
 * machine itself rather than a fixed catalogue.
 *
 * @typeParam M - The robot3 {@link Machine} type whose context extends {@link FlowContextInterface}.
 * @param props - Component props: the `machine` instance to run and an `onEvent` handler that
 *   receives every event the machine emits.
 * @returns A React element rendering the machine's current `component` inside the flow context,
 *   with a {@link FlowHeader} above it.
 * @internal
 */
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
