import { createMachine } from 'robot3'
import { useMachine } from 'react-robot'
import { Suspense, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { InformationRequestList } from './InformationRequestList'
import { informationRequestsMachine } from './informationRequestsStateMachine'
import { type InformationRequestsContextInterface } from './InformationRequestsComponents'
import { BaseBoundaries, type BaseComponentInterface } from '@/components/Base'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { FlowContext } from '@/components/Flow/useFlow'
import { useComponentDictionary, useI18n } from '@/i18n'
import { informationRequestEvents, type EventType } from '@/shared/constants'

interface SubmissionAlert {
  id: number
}

interface SubmissionAlertState {
  nextAlertId: number
  alerts: SubmissionAlert[]
}

const ALERT_TYPE = 'informationRequestResponded' as const

function InformationRequestsFlowRoot({
  companyId,
  dictionary,
  withAlert = true,
  onEvent = () => {},
  LoaderComponent,
}: InformationRequestsFlowProps) {
  useComponentDictionary('InformationRequests', dictionary)
  useI18n('InformationRequests')
  const { t } = useTranslation('InformationRequests')
  const { Modal, LoadingSpinner, Alert, Text } = useComponentContext()
  const [alertState, setAlertState] = useState<SubmissionAlertState>({
    nextAlertId: 0,
    alerts: [],
  })

  const handleDismissAlert = useCallback((alertId: number) => {
    setAlertState(prev => ({
      ...prev,
      alerts: prev.alerts.filter(alert => alert.id !== alertId),
    }))
  }, [])

  const addSubmissionAlert = useCallback(() => {
    setAlertState(prev => ({
      nextAlertId: prev.nextAlertId + 1,
      alerts: [{ id: prev.nextAlertId }, ...prev.alerts],
    }))
  }, [])

  const informationRequestsMachineInstance = useMemo(
    () =>
      createMachine(
        'list',
        informationRequestsMachine,
        (): InformationRequestsContextInterface => ({
          component: null,
          companyId,
          onEvent: handleEvent,
          LoaderComponent,
        }),
      ),
    [companyId, LoaderComponent],
  )
  const [current, send] = useMachine(informationRequestsMachineInstance)

  const CurrentComponent = current.context.component
  const Footer = CurrentComponent?.Footer || undefined
  // Modal visibility is derived from the state machine — when the machine
  // is in the `form` state, `component` is non-null and the modal opens.
  // This eliminates the class of bugs where a separate `isModalOpen` flag
  // drifts out of sync with the machine (e.g. closing via backdrop/Escape
  // without sending a state-machine event).
  const isModalOpen = CurrentComponent !== null

  function handleEvent(type: EventType, data?: unknown) {
    send({ type, payload: data })

    if (type === informationRequestEvents.INFORMATION_REQUEST_FORM_DONE && withAlert) {
      addSubmissionAlert()
    }

    onEvent(type, data)
  }

  const handleCloseModal = () => {
    handleEvent(informationRequestEvents.INFORMATION_REQUEST_FORM_CANCEL)
  }

  return (
    <FlowContext.Provider
      value={{
        ...current.context,
        onEvent: handleEvent,
      }}
    >
      <Flex flexDirection="column" gap={32}>
        {withAlert &&
          alertState.alerts.map(alert => (
            <Alert
              key={alert.id}
              status="success"
              label={t(`alerts.${ALERT_TYPE}.title`)}
              onDismiss={() => {
                handleDismissAlert(alert.id)
              }}
            >
              <Text>{t(`alerts.${ALERT_TYPE}.description`)}</Text>
            </Alert>
          ))}

        <Suspense fallback={<LoadingSpinner />}>
          <InformationRequestList companyId={companyId} onEvent={handleEvent} />
        </Suspense>
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          footer={
            Footer && (
              <BaseBoundaries LoaderComponent={LoaderComponent}>
                <Suspense fallback={<LoadingSpinner size="sm" />}>
                  <Footer onEvent={handleEvent} />
                </Suspense>
              </BaseBoundaries>
            )
          }
        >
          {CurrentComponent && <CurrentComponent />}
        </Modal>
      </Flex>
    </FlowContext.Provider>
  )
}

/**
 * Props for {@link InformationRequestsFlow}.
 *
 * @public
 */
export interface InformationRequestsFlowProps extends Omit<
  BaseComponentInterface<'InformationRequests'>,
  'onEvent'
> {
  /** The associated company identifier. */
  companyId: string
  /**
   * When `true` (default), the submission success alert is rendered at the top of this component.
   * Set to `false` when embedding in a parent that renders the alert elsewhere.
   */
  withAlert?: boolean
  /** Callback invoked when the flow or its blocks emit an event. */
  onEvent?: BaseComponentInterface['onEvent']
}

/**
 * Hub for viewing and responding to outstanding information requests from Gusto.
 *
 * @remarks
 * Renders the list of open and submitted information requests for a company and hosts the response form in a modal.
 * On successful submit, a dismissible success alert appears at the top of the list (when `withAlert` is `true`) and the modal closes.
 *
 * Information requests can also block payroll processing; in that case they are surfaced inline within
 * `Payroll.PayrollBlockerList`, which embeds this flow with `withAlert={false}` so the blocker list owns the alert UX.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `informationRequest/respond` | Fired when the user clicks "Respond" on a request and the form modal opens | `{ requestId: string }` |
 * | `informationRequest/form/done` | Fired when an information request is successfully submitted | Response from the Submit information request endpoint |
 * | `informationRequest/form/cancel` | Fired when the user cancels the response form (closes the modal without submitting) | — |
 *
 * Each piece is also exported as a standalone block (see the Blocks
 * table) for composing a custom workflow when this orchestration is the wrong
 * fit. See the
 * {@link https://sdk.gusto.com/docs/guides/integration-guide/composition | Composition guide}
 * for how to recompose these blocks into your own flow.
 *
 * @components
 * - {@link InformationRequestList}
 * - {@link InformationRequestForm}
 *
 * @param props - See {@link InformationRequestsFlowProps}.
 * @returns The information requests flow surface.
 * @public
 *
 * @example
 * ```tsx title="App.tsx"
 * import { InformationRequests } from '@gusto/embedded-react-sdk'
 *
 * function MyApp() {
 *   return (
 *     <InformationRequests.InformationRequestsFlow
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function InformationRequestsFlow({
  FallbackComponent,
  LoaderComponent,
  ...props
}: InformationRequestsFlowProps) {
  return (
    <BaseBoundaries
      componentName="InformationRequests"
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
    >
      <InformationRequestsFlowRoot LoaderComponent={LoaderComponent} {...props} />
    </BaseBoundaries>
  )
}
