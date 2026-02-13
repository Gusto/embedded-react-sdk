import { useTranslation } from 'react-i18next'
import { InformationRequestStatus } from '@gusto/embedded-api/models/components/informationrequest'
import { useInformationRequestList } from './useInformationRequestList'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { DataView } from '@/components/Common/DataView/DataView'
import { useDataView } from '@/components/Common/DataView/useDataView'
import { EmptyData, Flex, FlexItem } from '@/components/Common'
import type { EventType } from '@/shared/constants'

interface InformationRequestListProps extends BaseComponentInterface<'InformationRequests.InformationRequestList'> {
  companyId: string
  filterByPayrollBlocking?: boolean
  onEvent: OnEventType<EventType, unknown>
}

export function InformationRequestList(props: InformationRequestListProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({
  companyId,
  dictionary,
  filterByPayrollBlocking,
  onEvent,
}: InformationRequestListProps) {
  useComponentDictionary('InformationRequests.InformationRequestList', dictionary)
  useI18n('InformationRequests.InformationRequestList')
  const { t } = useTranslation('InformationRequests.InformationRequestList')
  const { Heading, Text, Button, Badge } = useComponentContext()

  const { data, actions, meta } = useInformationRequestList({
    companyId,
    filterByPayrollBlocking,
    onEvent,
  })

  const dataViewProps = useDataView({
    data: data.visibleRequests,
    emptyState: () => (
      <EmptyData title={t('emptyTableTitle')} description={t('emptyTableDescription')} />
    ),
    columns: [
      {
        key: 'type',
        title: t('columns.type'),
        render: request => (
          <FlexItem flexGrow={1}>
            <Text weight="medium">{meta.getTypeLabel(request.type)}</Text>
          </FlexItem>
        ),
      },
      {
        key: 'status',
        title: t('columns.status'),
        render: request => {
          const statusMapping = meta.getStatusMapping(request.status)
          const showPayrollBlockingBadge = !meta.filterByPayrollBlocking && request.blockingPayroll

          if (!statusMapping && !showPayrollBlockingBadge) {
            return null
          }

          return (
            <Flex gap={8} alignItems="center">
              {statusMapping && (
                <Badge status={statusMapping.badgeStatus}>{statusMapping.label}</Badge>
              )}
              {showPayrollBlockingBadge && (
                <Badge status="error">{t('status.payrollBlocking')}</Badge>
              )}
            </Flex>
          )
        },
      },
    ],
    itemMenu: request => {
      const isPendingResponse = request.status === InformationRequestStatus.PendingResponse
      if (!isPendingResponse) {
        return null
      }
      return (
        <Button
          variant="secondary"
          onClick={() => {
            actions.handleRespond(request.uuid)
          }}
        >
          {t('cta.respond')}
        </Button>
      )
    },
  })

  return (
    <Flex flexDirection="column" gap={20}>
      <Flex flexDirection="column" gap={2}>
        <Heading as="h2" styledAs="h4">
          {t('title')}
        </Heading>
        {data.visibleRequests.length > 0 && <Text>{t('description')}</Text>}
      </Flex>

      <DataView {...dataViewProps} label={t('title')} />
    </Flex>
  )
}
