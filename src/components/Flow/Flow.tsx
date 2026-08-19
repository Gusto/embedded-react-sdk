import { Suspense } from 'react'
import type { OnEventType } from '../Base/useBase'
import { Flex } from '../Common/Flex'
import type { FlowContextInterface } from './useFlow'
import { FlowContext } from './useFlow'
import { FlowHeader } from './FlowHeader'
import { useMachine, type Machine } from '@/lib/state-machine'
import { useLoadingIndicator } from '@/contexts/LoadingIndicatorProvider/useLoadingIndicator'
import { type EventType } from '@/shared/constants'

/**
 * Header chrome is short (a back-button row is the only header that can suspend),
 * so the header fallback matches its height rather than the full content loader —
 * this keeps the step body at the same level, avoiding a layout shift.
 */
const HEADER_LOADER_HEIGHT = 40

/**
 * Fallback for the {@link FlowHeader} Suspense boundary. FlowHeader calls
 * `useTranslation` and renders above the active step's own boundary, so a
 * first-time i18n namespace load during a synchronous transition would otherwise
 * throw React #426. Reuses the SDK loading indicator sized to the header height
 * so the placeholder matches the header chrome and the step body doesn't shift.
 * (Step components manage their own loading via `BaseComponent`/`BaseBoundaries`.)
 */
function FlowHeaderFallback() {
  const { LoadingIndicator } = useLoadingIndicator()
  return <LoadingIndicator height={HEADER_LOADER_HEIGHT} />
}

type FlowProps<M extends Machine> = {
  machine: M
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Drives a state machine that orchestrates a multi-step SDK flow, rendering the active
 * step component inside a {@link FlowContext} provider with optional header chrome above it.
 *
 * @remarks
 * Re-emits every event to the upstream `onEvent` callback, so the consuming flow component
 * (e.g. `PayrollFlow`, `OnboardingFlow`) can forward them to partner code. The set of event
 * types is defined by the machine itself rather than a fixed catalogue.
 *
 * @typeParam M - The {@link Machine} type whose context extends {@link FlowContextInterface}.
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
  const [current, send] = useMachine(machine, {
    onEvent: handleEvent,
    component: null,
  })

  function handleEvent(type: EventType, data: unknown): void {
    send({ type, payload: data })
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
          <Suspense fallback={<FlowHeaderFallback />}>
            <FlowHeader />
          </Suspense>
          {Component && <Component />}
        </Flex>
      </FlowContext.Provider>
    </Flex>
  )
}
