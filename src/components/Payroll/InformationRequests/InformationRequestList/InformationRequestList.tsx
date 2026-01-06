import { useTranslation } from 'react-i18next'
import styles from './InformationRequestList.module.scss'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { DataView } from '@/components/Common/DataView/DataView'
import { useDataView } from '@/components/Common/DataView/useDataView'
import { Flex, FlexItem } from '@/components/Common'
import { informationRequestEvents } from '@/shared/constants'

interface InformationRequestListProps extends BaseComponentInterface<'Payroll.InformationRequestList'> {
  companyId: string
  onEvent: BaseComponentInterface['onEvent']
}

export function InformationRequestList(props: InformationRequestListProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ dictionary, onEvent }: InformationRequestListProps) {
  useComponentDictionary('Payroll.InformationRequestList', dictionary)
  useI18n('Payroll.InformationRequestList')
  const { t } = useTranslation('Payroll.InformationRequestList')
  const { Heading, Text, Button, Badge } = useComponentContext()

  // TODO: Replace with actual RFI data and add it to the following table

  const dataViewProps = useDataView({
    data: [{ id: 'placeholder' }],
    columns: [
      {
        title: 'Type',
        render: () => (
          <FlexItem flexGrow={1}>
            <Text weight="semibold">Company onboarding</Text>
          </FlexItem>
        ),
      },
      {
        title: 'Status',
        render: () => (
          <Flex gap={8} alignItems="center">
            <Badge status="info">Replace with status</Badge>
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
                onEvent(informationRequestEvents.INFORMATION_REQUEST_RESPOND, {
                  requestId: 'placeholder-id',
                })
              }}
            >
              {t('cta.respond')}
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
