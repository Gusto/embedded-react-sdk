import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { InformationRequestList } from './InformationRequestList'
import { useInformationRequestsFlow } from './useInformationRequestsFlow'
import { BaseBoundaries, type BaseComponentInterface } from '@/components/Base'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { FlowContext } from '@/components/Flow/useFlow'
import { useComponentDictionary, useI18n } from '@/i18n'

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

  const {
    data: { alertState },
    actions: { handleEvent, handleCloseModal, handleDismissAlert },
    meta: { isModalOpen, current, CurrentComponent, Footer },
  } = useInformationRequestsFlow({ companyId, withAlert, onEvent })

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
