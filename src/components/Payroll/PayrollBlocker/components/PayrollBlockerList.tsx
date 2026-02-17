import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { getBlockerTranslationKeys } from '../payrollHelpers'
import { usePayrollBlockerList } from '../usePayrollBlockerList'
import styles from './PayrollBlockerList.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex, FlexItem } from '@/components/Common'
import { DataView } from '@/components/Common/DataView/DataView'
import { useDataView } from '@/components/Common/DataView/useDataView'
import { useComponentDictionary, useI18n } from '@/i18n'
import { RecoveryCases } from '@/components/Payroll/RecoveryCases'
import { InformationRequestsFlow } from '@/components/InformationRequests'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'

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

  const {
    data: { payrollBlockerList, alertState },
    actions: { handleEvent, handleDismissAlert },
    meta: { hasBlockers, hasUnrecoveredCases, hasBlockingInformationRequests, hasAnyContent },
  } = usePayrollBlockerList({ companyId, onEvent })

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

  const dataViewProps = useDataView({
    data: blockers,
    columns: [
      {
        title: t('blockerSectionLabel'),
        render: (blocker: PayrollBlocker) => (
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
        render: (blocker: PayrollBlocker) => {
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
          <InformationRequestsFlow
            companyId={companyId}
            filterByPayrollBlocking
            withAlert={false}
            onEvent={handleEvent}
          />
        )}
      </Flex>
    </div>
  )
}
