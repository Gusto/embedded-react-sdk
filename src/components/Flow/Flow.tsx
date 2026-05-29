import { useMachine } from 'react-robot'
import { type Machine, type SendFunction } from 'robot3'
import { useCallback } from 'react'
import type { OnEventType } from '../Base/useBase'
import { Flex } from '../Common/Flex'
import type { FlowContextInterface } from './useFlow'
import { FlowContext } from './useFlow'
import { FlowHeader } from './FlowHeader'
import { useBrowserHistorySync, type HistorySyncReplaceTransition } from './useBrowserHistorySync'
import { componentEvents, type EventType } from '@/shared/constants'

export interface FlowHistorySyncConfig {
  validStateNames: readonly string[]
  terminalStateNames: readonly string[]
  replaceStateTransitions?: readonly HistorySyncReplaceTransition[]
}

type FlowProps<M extends Machine> = {
  machine: M
  onEvent: OnEventType<EventType, unknown>
  historySync?: FlowHistorySyncConfig
}

export const Flow = <M extends Machine<object, FlowContextInterface>>({
  onEvent,
  machine,
  historySync,
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

  const navigateToStep = useCallback(
    (target: string) => {
      const event = { type: componentEvents.GOTO_STEP, payload: { target } }
      if (service.child) {
        ;(service.child.send as SendFunction<string>)(event)
      } else {
        ;(send as SendFunction<string>)(event)
      }
    },
    [send, service],
  )

  useBrowserHistorySync({
    enabled: Boolean(historySync),
    currentStateName: current.name,
    validStateNames: historySync?.validStateNames ?? [],
    terminalStateNames: historySync?.terminalStateNames ?? [],
    replaceStateTransitions: historySync?.replaceStateTransitions,
    onNavigate: navigateToStep,
  })

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
