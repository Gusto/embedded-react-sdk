import { useTranslation } from 'react-i18next'
import { useRecoveryCasesGet } from '@gusto/embedded-api/react-query/recoveryCasesGet'
import styles from './RecoveryCasesList.module.scss'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { DataView } from '@/components/Common/DataView/DataView'
import { useDataView } from '@/components/Common/DataView/useDataView'
import { Flex, FlexItem } from '@/components/Common'
import { recoveryCasesEvents } from '@/shared/constants'

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

function Root({ companyId, dictionary, onEvent }: RecoveryCasesListProps) {
  useComponentDictionary('Payroll.RecoveryCasesList', dictionary)
  useI18n('Payroll.RecoveryCasesList')
  const { t } = useTranslation('Payroll.RecoveryCasesList')
  const { Heading, Text, Button, Badge } = useComponentContext()

  const { data, isFetching } = useRecoveryCasesGet({
    companyUuid: companyId,
  })

  const recoveryCases = data?.recoveryCaseList ?? []

  const dataViewProps = useDataView({
    data: recoveryCases,
    isFetching,
    columns: [
      {
        key: 'originalDebitDate',
        title: t('columns.originalDebitDate'),
        render: () => (
          <FlexItem flexGrow={1}>
            {/* TODO: Wire up actual data in subsequent ticket */}
            <Text>2025-10-11</Text>
          </FlexItem>
        ),
      },
      {
        key: 'totalAmount',
        title: t('columns.totalAmount'),
        render: () => (
          // TODO: Wire up actual data in subsequent ticket
          <Text>$30,093.45</Text>
        ),
      },
      {
        key: 'amountOutstanding',
        title: t('columns.amountOutstanding'),
        render: () => (
          // TODO: Wire up actual data in subsequent ticket
          <Text>$30,093.45</Text>
        ),
      },
      {
        key: 'latestErrorCode',
        title: t('columns.latestErrorCode'),
        render: () => (
          // TODO: Wire up actual data with useRecoveryCaseErrorCode hook in subsequent ticket
          <Flex flexDirection="column" gap={4}>
            <Text weight="semibold">R01: Insufficient funds</Text>
            <Text>Ensure sufficient funds to unblock your account</Text>
          </Flex>
        ),
      },
      {
        key: 'status',
        title: t('columns.status'),
        render: () => (
          // TODO: Wire up actual status mapping in subsequent ticket
          <Flex gap={8} alignItems="center">
            <Badge status="info">Open</Badge>
          </Flex>
        ),
      },
    ],
    itemMenu: recoveryCase => (
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
    ),
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
