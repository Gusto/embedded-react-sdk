import { useTranslation } from 'react-i18next'
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

function Root({ dictionary, onEvent }: RecoveryCasesListProps) {
  useComponentDictionary('Payroll.RecoveryCasesList', dictionary)
  useI18n('Payroll.RecoveryCasesList')
  const { t } = useTranslation('Payroll.RecoveryCasesList')
  const { Heading, Text, Button, Badge } = useComponentContext()

  // TODO: Replace with actual recovery cases data from API

  const dataViewProps = useDataView({
    data: [{ id: 'placeholder' }],
    columns: [
      {
        title: t('columns.originalDebitDate'),
        render: () => (
          <FlexItem flexGrow={1}>
            <Text>2025-10-11</Text>
          </FlexItem>
        ),
      },
      {
        title: t('columns.totalAmount'),
        render: () => <Text>$30,093.45</Text>,
      },
      {
        title: t('columns.amountOutstanding'),
        render: () => <Text>$30,093.45</Text>,
      },
      {
        title: t('columns.latestErrorCode'),
        render: () => (
          <Flex flexDirection="column" gap={4}>
            <Text weight="semibold">R01: Insufficient funds</Text>
            <Text>Ensure sufficient funds to unblock your account</Text>
          </Flex>
        ),
      },
      {
        title: t('columns.status'),
        render: () => (
          <Flex gap={8} alignItems="center">
            <Badge status="info">Open</Badge>
          </Flex>
        ),
      },
      {
        title: '',
        render: () => (
          <Flex justifyContent="flex-end" alignItems="center">
            <Button
              variant="secondary"
              onClick={() => {
                onEvent(recoveryCasesEvents.RECOVERY_CASE_RESOLVE, {
                  recoveryCaseId: 'placeholder-id',
                })
              }}
            >
              {t('cta.resolve')}
            </Button>
          </Flex>
        ),
      },
    ],
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
