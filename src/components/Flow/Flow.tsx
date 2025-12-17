import { useMachine } from 'react-robot'
import { type Machine, type SendFunction } from 'robot3'
import { useTranslation } from 'react-i18next'
import type { OnEventType } from '../Base/useBase'
import { FlowBreadcrumbs } from '../Common/FlowBreadcrumbs/FlowBreadcrumbs'
import { Flex } from '../Common/Flex'
import { FlexItem } from '../Common'
import type { FlowContextInterface } from './useFlow'
import { FlowContext } from './useFlow'
import { type EventType } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

type FlowProps<M extends Machine> = {
  machine: M
  onEvent: OnEventType<EventType, unknown>
}

export const Flow = <M extends Machine<object, FlowContextInterface>>({
  onEvent,
  machine,
}: FlowProps<M>) => {
  const Components = useComponentContext()
  const { t } = useTranslation()
  const [current, send, service] = useMachine(machine, {
    onEvent: handleEvent,
    component: null,
    progressBarCta: null,
  })

  const {
    progressBarType = null,
    totalSteps = null,
    currentStep = null,
    currentBreadcrumbId,
    breadcrumbs = {},
  } = current.context

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

  return (
    <Flex>
      <FlowContext.Provider
        value={{
          ...current.context,
        }}
      >
        <Flex flexDirection="column" gap={32}>
          {progressBarType === 'progress' && currentStep && totalSteps && (
            <Components.ProgressBar
              totalSteps={totalSteps}
              currentStep={currentStep}
              label={t('progressBarLabel', { totalSteps, currentStep })}
              cta={current.context.progressBarCta}
            />
          )}
          {progressBarType === 'breadcrumbs' && (
            <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
              <FlexItem flexGrow={1}>
                <FlowBreadcrumbs
                  breadcrumbs={currentBreadcrumbId ? (breadcrumbs[currentBreadcrumbId] ?? []) : []}
                  currentBreadcrumbId={currentBreadcrumbId}
                  onEvent={handleEvent}
                />
              </FlexItem>
              <FlexItem>
                {current.context.progressBarCta && <current.context.progressBarCta />}
              </FlexItem>
            </Flex>
          )}
          {current.context.component && <current.context.component />}
        </Flex>
      </FlowContext.Provider>
    </Flex>
  )
}
