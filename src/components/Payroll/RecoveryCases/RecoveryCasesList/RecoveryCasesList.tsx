import { useTranslation } from 'react-i18next'
import type {
  RecoveryCase,
  RecoveryCaseStatus,
} from '@gusto/embedded-api/models/components/recoverycase'
import { useRecoveryCasesGet } from '@gusto/embedded-api/react-query/recoveryCasesGet'
import { useRecoveryCaseErrorCode } from '../useRecoveryCaseErrorCode'
import styles from './RecoveryCasesList.module.scss'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { DataView } from '@/components/Common/DataView/DataView'
import { useDataView } from '@/components/Common/DataView/useDataView'
import { Flex, FlexItem } from '@/components/Common'
import { recoveryCasesEvents } from '@/shared/constants'
import type { BadgeProps } from '@/components/Common/UI/Badge/BadgeTypes'
import { formatNumberAsCurrency } from '@/helpers/formattedStrings'

interface RecoveryCasesListProps extends BaseComponentInterface<'Payroll.RecoveryCasesList'> {
  companyId: string
  onEvent: BaseComponentInterface['onEvent']
}

export function RecoveryCasesList(props: RecoveryCasesListProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function getStatusBadgeStatus(status: RecoveryCaseStatus | undefined): BadgeProps['status'] {
  if (status === 'open') {
    return 'info'
  }
  return 'warning'
}

function ErrorCodeCell({ errorCode }: { errorCode: string | null | undefined }) {
  const { Text } = useComponentContext()
  const { title, subtitle } = useRecoveryCaseErrorCode(errorCode)

  if (!title && !subtitle) {
    return null
  }

  return (
    <Flex flexDirection="column" gap={4}>
      {title && <Text weight="semibold">{title}</Text>}
      {subtitle && <Text>{subtitle}</Text>}
    </Flex>
  )
}

function StatusCell({ status }: { status: RecoveryCaseStatus | undefined }) {
  useI18n('Payroll.RecoveryCasesList')
  const { t } = useTranslation('Payroll.RecoveryCasesList')
  const { Badge } = useComponentContext()

  if (!status) {
    return null
  }

  const badgeStatus = getStatusBadgeStatus(status)
  const statusLabel = t(`status.${status}`)

  return <Badge status={badgeStatus}>{statusLabel}</Badge>
}

function ResolveButton({
  recoveryCase,
  onEvent,
}: {
  recoveryCase: RecoveryCase
  onEvent: BaseComponentInterface['onEvent']
}) {
  useI18n('Payroll.RecoveryCasesList')
  const { t } = useTranslation('Payroll.RecoveryCasesList')
  const { Button } = useComponentContext()

  if (recoveryCase.status !== 'open') {
    return null
  }

  return (
    <Button
      variant="secondary"
      onClick={() => {
        onEvent(recoveryCasesEvents.RECOVERY_CASE_RESOLVE, {
          recoveryCaseId: recoveryCase.uuid,
        })
      }}
    >
      {t('cta.resolve')}
    </Button>
  )
}

function Root({ companyId, dictionary, onEvent }: RecoveryCasesListProps) {
  useComponentDictionary('Payroll.RecoveryCasesList', dictionary)
  useI18n('Payroll.RecoveryCasesList')
  const { t } = useTranslation('Payroll.RecoveryCasesList')
  const { Heading, Text } = useComponentContext()

  const { data, isFetching } = useRecoveryCasesGet({
    companyUuid: companyId,
  })

  const recoveryCases = (data?.recoveryCaseList ?? []).filter(rc => rc.status !== 'recovered')

  const dataViewProps = useDataView({
    data: recoveryCases,
    isFetching,
    columns: [
      {
        key: 'originalDebitDate',
        title: t('columns.originalDebitDate'),
        render: recoveryCase => (
          <FlexItem flexGrow={1}>
            <Text>{recoveryCase.originalDebitDate ?? '-'}</Text>
          </FlexItem>
        ),
      },
      {
        key: 'totalAmount',
        title: t('columns.totalAmount'),
        render: recoveryCase => (
          <Text>
            {recoveryCase.eventTotalAmount
              ? formatNumberAsCurrency(parseFloat(recoveryCase.eventTotalAmount))
              : '-'}
          </Text>
        ),
      },
      {
        key: 'amountOutstanding',
        title: t('columns.amountOutstanding'),
        render: recoveryCase => (
          <Text>
            {recoveryCase.amountOutstanding
              ? formatNumberAsCurrency(parseFloat(recoveryCase.amountOutstanding))
              : '-'}
          </Text>
        ),
      },
      {
        key: 'latestErrorCode',
        title: t('columns.latestErrorCode'),
        render: recoveryCase => <ErrorCodeCell errorCode={recoveryCase.latestErrorCode} />,
      },
      {
        key: 'status',
        title: t('columns.status'),
        render: recoveryCase => <StatusCell status={recoveryCase.status} />,
      },
    ],
    itemMenu: recoveryCase => <ResolveButton recoveryCase={recoveryCase} onEvent={onEvent} />,
  })

  return (
    <div className={styles.root}>
      <Flex flexDirection="column" gap={24}>
        <div className={styles.header}>
          <Heading as="h2" styledAs="h3">
            {t('title')}
          </Heading>
          <Text>{t('description')}</Text>
        </div>

        <DataView {...dataViewProps} label={t('title')} />
      </Flex>
    </div>
  )
}
