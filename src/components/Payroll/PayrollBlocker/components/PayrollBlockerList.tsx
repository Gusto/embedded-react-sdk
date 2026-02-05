import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { usePayrollsGetBlockersSuspense } from '@gusto/embedded-api/react-query/payrollsGetBlockers'
import { useRecoveryCasesGetSuspense } from '@gusto/embedded-api/react-query/recoveryCasesGet'
import { useInformationRequestsGetInformationRequestsSuspense } from '@gusto/embedded-api/react-query/informationRequestsGetInformationRequests'
import { InformationRequestStatus } from '@gusto/embedded-api/models/components/informationrequest'
import { getBlockerTranslationKeys } from '../payrollHelpers'
import styles from './PayrollBlockerList.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex, FlexItem } from '@/components/Common'
import { DataView } from '@/components/Common/DataView/DataView'
import { useDataView } from '@/components/Common/DataView/useDataView'
import { useComponentDictionary, useI18n } from '@/i18n'
import { RecoveryCases } from '@/components/Payroll/RecoveryCases'
import { InformationRequests } from '@/components/InformationRequests'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { informationRequestEvents, recoveryCasesEvents, type EventType } from '@/shared/constants'

type ResponseAlertType = 'recoveryCaseResubmitted' | 'informationRequestResponded'

interface ResponseAlert {
  id: number
  type: ResponseAlertType
}

interface ResponseAlertState {
  id: number
  alerts: ResponseAlert[]
}

interface PayrollBlocker {
  id: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

interface PayrollBlockerListProps extends BaseComponentInterface<'Payroll.PayrollBlocker'> {
  companyId: string
}

/**
 * PayrollBlockerList - DataView-based component displaying payroll blockers
 * Shows each blocker with individual resolution buttons
 * Also displays recovery cases and information requests sections when applicable
 */
export function PayrollBlockerList(props: PayrollBlockerListProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ className, companyId, dictionary, onEvent }: PayrollBlockerListProps) {
  useComponentDictionary('Payroll.PayrollBlocker', dictionary)
  useI18n('Payroll.PayrollBlocker')
  const { t } = useTranslation('Payroll.PayrollBlocker')
  const { Button, Text, Heading, Alert } = useComponentContext()

  const [alertState, setAlertState] = useState<ResponseAlertState>({
    id: 0,
    alerts: [],
  })

  const handleDismissAlert = useCallback((alertId: number) => {
    setAlertState(prev => ({
      ...prev,
      alerts: prev.alerts.filter(alert => alert.id !== alertId),
    }))
  }, [])

  const addAlert = useCallback((alertType: ResponseAlertType) => {
    setAlertState(prev => ({
      id: prev.id + 1,
      alerts: [{ id: prev.id, type: alertType }, ...prev.alerts],
    }))
  }, [])

  const handleEvent = useCallback(
    (type: EventType, data?: unknown) => {
      if (type === recoveryCasesEvents.RECOVERY_CASE_RESUBMIT_DONE) {
        addAlert('recoveryCaseResubmitted')
      }

      if (type === informationRequestEvents.INFORMATION_REQUEST_FORM_DONE) {
        addAlert('informationRequestResponded')
      }

      onEvent(type, data)
    },
    [onEvent, addAlert],
  )

  const { data: blockersData } = usePayrollsGetBlockersSuspense({
    companyUuid: companyId,
  })

  const { data: recoveryCasesData } = useRecoveryCasesGetSuspense({
    companyUuid: companyId,
  })

  const { data: informationRequestsData } = useInformationRequestsGetInformationRequestsSuspense({
    companyUuid: companyId,
  })

  const payrollBlockerList = blockersData.payrollBlockerList ?? []
  const blockers: PayrollBlocker[] = payrollBlockerList.map(blocker => {
    const blockerKey = blocker.key ?? 'unknown'
    const translationKeys = getBlockerTranslationKeys(blockerKey)

    const title = t(translationKeys.titleKey, {
      defaultValue: blockerKey.replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase()),
    })

    const description = t(translationKeys.descriptionKey, {
      defaultValue: blocker.message || t('defaultBlockerDescription'),
    })

    return {
      id: blockerKey,
      title,
      description,
    }
  })

  const recoveryCases = recoveryCasesData.recoveryCaseList ?? []
  const informationRequests = informationRequestsData.informationRequestList ?? []

  const hasUnrecoveredCases = recoveryCases.some(
    recoveryCase => recoveryCase.status !== 'recovered',
  )

  const hasBlockingInformationRequests = informationRequests.some(
    request => request.blockingPayroll && request.status !== InformationRequestStatus.Approved,
  )

  const dataViewProps = useDataView({
    data: blockers,
    columns: [
      {
        title: t('blockerSectionLabel'),
        render: blocker => (
          <FlexItem flexGrow={1}>
            <Flex flexDirection="column" gap={8}>
              <Text weight="semibold">{blocker.title}</Text>
              <Text variant="supporting">{blocker.description}</Text>
            </Flex>
          </FlexItem>
        ),
      },
      {
        title: '',
        render: blocker => {
          const action = blocker.action

          if (!action) {
            return null
          }

          return (
            <Flex justifyContent="flex-end" alignItems="center">
              <Button variant="secondary" onClick={action.onClick} title={action.label}>
                {action.label}
              </Button>
            </Flex>
          )
        },
      },
    ],
  })

  const hasBlockers = blockers.length > 0
  const hasAnyContent = hasBlockers || hasUnrecoveredCases || hasBlockingInformationRequests

  if (!hasAnyContent) {
    return (
      <div className={classNames(styles.root, className)}>
        <Text>{t('noBlockersMessage')}</Text>
      </div>
    )
  }

  return (
    <div className={classNames(styles.root, className)}>
      <Flex flexDirection="column" gap={32}>
        {alertState.alerts.map(alert => (
          <Alert
            key={alert.id}
            status="success"
            label={t(`alerts.${alert.type}.title`)}
            onDismiss={() => {
              handleDismissAlert(alert.id)
            }}
          >
            <Text>{t(`alerts.${alert.type}.description`)}</Text>
          </Alert>
        ))}

        {hasBlockers && (
          <Flex flexDirection="column" gap={20}>
            <Heading as="h2" styledAs="h4">
              {t('blockersListTitle')}
            </Heading>
            <DataView {...dataViewProps} label={t('blockersListTitle')} />
          </Flex>
        )}

        {hasUnrecoveredCases && <RecoveryCases companyId={companyId} onEvent={handleEvent} />}

        {hasBlockingInformationRequests && (
          <InformationRequests
            companyId={companyId}
            filterByPayrollBlocking
            onEvent={handleEvent}
          />
        )}
      </Flex>
    </div>
  )
}
