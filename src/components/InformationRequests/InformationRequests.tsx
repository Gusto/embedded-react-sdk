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

export interface InformationRequestsFlowProps extends Omit<
  BaseComponentInterface<'InformationRequests'>,
  'onEvent'
> {
  companyId: string
  filterByPayrollBlocking?: boolean
  /**
   * When true (default), the submission success alert is rendered at the top of this component.
   * Set to false when embedding in a parent (e.g. PayrollBlockerList) that renders the alert elsewhere.
   */
  withAlert?: boolean
  onEvent?: BaseComponentInterface['onEvent']
}

const ALERT_TYPE = 'informationRequestResponded' as const

export function InformationRequestsFlow({
  companyId,
  dictionary,
  filterByPayrollBlocking = false,
  withAlert = true,
  onEvent = () => {},
}: InformationRequestsFlowProps) {
  useComponentDictionary('InformationRequests', dictionary)
  useI18n('InformationRequests')
  const { t } = useTranslation('InformationRequests')
  const { Modal, LoadingSpinner, Alert, Text } = useComponentContext()
  const [isModalOpen, setIsModalOpen] = useState(false)
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
        }),
      ),
    [companyId],
  )
  const [current, send] = useMachine(informationRequestsMachineInstance)

  function handleEvent(type: EventType, data?: unknown) {
    send({ type, payload: data })

    if (type === informationRequestEvents.INFORMATION_REQUEST_RESPOND) {
      setIsModalOpen(true)
    }

    if (
      type === informationRequestEvents.INFORMATION_REQUEST_FORM_CANCEL ||
      type === informationRequestEvents.INFORMATION_REQUEST_FORM_DONE
    ) {
      setIsModalOpen(false)
    }

    if (type === informationRequestEvents.INFORMATION_REQUEST_FORM_DONE && withAlert) {
      addSubmissionAlert()
    }

    onEvent(type, data)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const CurrentComponent = current.context.component
  const Footer = CurrentComponent?.Footer || undefined

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
          <InformationRequestList
            companyId={companyId}
            filterByPayrollBlocking={filterByPayrollBlocking}
            onEvent={handleEvent}
          />
        </Suspense>
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          footer={
            Footer && (
              <BaseBoundaries LoaderComponent={() => <LoadingSpinner size="sm" />}>
                <Footer onEvent={handleEvent} />
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
