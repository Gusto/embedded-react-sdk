import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { usePayrollsGetBlockersSuspense } from '@gusto/embedded-api/react-query/payrollsGetBlockers'
import {
  getBlockerTranslationKeys,
  PENDING_INFORMATION_REQUEST_BLOCKER_KEY,
  PENDING_RECOVERY_CASE_BLOCKER_KEY,
} from '../payrollHelpers'
import styles from './PayrollBlockerList.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex, FlexItem } from '@/components/Common'
import { DataView } from '@/components/Common/DataView/DataView'
import { useDataView } from '@/components/Common/DataView/useDataView'
import { useComponentDictionary, useI18n } from '@/i18n'
import { RecoveryCases } from '@/components/Payroll/RecoveryCases'
import { InformationRequestsFlow } from '@/components/InformationRequests'
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

/**
 * Props for {@link PayrollBlockerList}.
 *
 * @public
 */
export interface PayrollBlockerListProps extends BaseComponentInterface<'Payroll.PayrollBlocker'> {
  /** The associated company identifier. */
  companyId: string
}

/**
 * Displays the list of blockers preventing payroll from being processed for a company.
 *
 * @remarks
 * Blockers indicate issues that must be resolved before a payroll can be calculated or
 * submitted, such as missing employee information, invalid tax setups, or incomplete
 * company configuration. The component also renders open recovery cases and outstanding
 * information requests for the company when present, and re-emits any events those
 * embedded surfaces fire through `onEvent`.
 *
 * @param props - {@link PayrollBlockerListProps}
 * @returns The rendered blocker list.
 * @public
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

  const payrollBlockerList = blockersData.payrollBlockers ?? []
  const blockers: PayrollBlocker[] = payrollBlockerList.map(blocker => {
    const blockerKey = blocker.key
    const translationKeys = getBlockerTranslationKeys(blockerKey)

    const title = t(translationKeys.titleKey, {
      defaultValue: t('genericBlockerTitle'),
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

  // Gate the recovery-cases and information-requests surfaces on the backend's own blocker keys
  // rather than eagerly fetching each one here. Those surfaces self-fetch inside their own error
  // boundaries, so probing them from this parent both duplicated the request and, when the flow's
  // token wasn't scoped for that endpoint (e.g. recovery cases in the dismissal flow), threw and
  // took down the entire blocker screen -- including an otherwise-viewable RFI (SDK-1347).
  const hasRecoveryCaseBlocker = payrollBlockerList.some(
    blocker => blocker.key === PENDING_RECOVERY_CASE_BLOCKER_KEY,
  )
  const hasInformationRequestBlocker = payrollBlockerList.some(
    blocker => blocker.key === PENDING_INFORMATION_REQUEST_BLOCKER_KEY,
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
  const hasAnyContent = hasBlockers || hasRecoveryCaseBlocker || hasInformationRequestBlocker

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

        {hasRecoveryCaseBlocker && <RecoveryCases companyId={companyId} onEvent={handleEvent} />}

        {hasInformationRequestBlocker && (
          <InformationRequestsFlow companyId={companyId} withAlert={false} onEvent={handleEvent} />
        )}
      </Flex>
    </div>
  )
}
