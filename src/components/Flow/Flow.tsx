import { useMachine } from 'react-robot'
import { type Machine } from 'robot3'
import { useTranslation } from 'react-i18next'
import type { OnEventType } from '../Base/useBase'
import type { FlowContextInterface } from './useFlow'
import { FlowContext } from './useFlow'
import { type EventType } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

type FlowProps = {
  machine: Machine<object, FlowContextInterface>
  onEvent: OnEventType<EventType, unknown>
}

export const Flow = ({ onEvent, machine }: FlowProps) => {
  const Components = useComponentContext()
  const { t } = useTranslation()
  const [current, send, service] = useMachine(machine, {
    onEvent: handleEvent,
    component: null,
    progressBarCta: null,
  })

  const showProgress = current.context.showProgress ?? false
  const totalSteps = current.context.totalSteps ?? null
  const currentStep = current.context.currentStep ?? null

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
        {showProgress && currentStep && totalSteps && (
          <Components.ProgressBar
            totalSteps={totalSteps}
            currentStep={currentStep}
            label={t('progressBarLabel', { totalSteps, currentStep })}
            cta={current.context.progressBarCta}
          />
        )}
        {current.context.component && <current.context.component />}
      </FlowContext.Provider>
    </>
  )
}
