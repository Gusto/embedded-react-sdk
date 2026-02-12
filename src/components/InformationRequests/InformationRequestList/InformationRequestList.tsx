import { useTranslation } from 'react-i18next'
import { useInformationRequestsGetInformationRequestsSuspense } from '@gusto/embedded-api/react-query/informationRequestsGetInformationRequests'
import type { InformationRequest } from '@gusto/embedded-api/models/components/informationrequest'
import {
  InformationRequestStatus,
  InformationRequestType,
} from '@gusto/embedded-api/models/components/informationrequest'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { DataView } from '@/components/Common/DataView/DataView'
import { useDataView } from '@/components/Common/DataView/useDataView'
import { EmptyData, Flex, FlexItem } from '@/components/Common'
import { informationRequestEvents } from '@/shared/constants'
import type { BadgeProps } from '@/components/Common/UI/Badge/BadgeTypes'

interface InformationRequestListProps extends BaseComponentInterface<'InformationRequests.InformationRequestList'> {
  companyId: string
  filterByPayrollBlocking?: boolean
  onEvent: BaseComponentInterface['onEvent']
}

export function InformationRequestList(props: InformationRequestListProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

type StatusMapping = {
  label: string
  badgeStatus: BadgeProps['status']
} | null

function Root({
  companyId,
  dictionary,
  filterByPayrollBlocking = false,
  onEvent,
}: InformationRequestListProps) {
  useComponentDictionary('InformationRequests.InformationRequestList', dictionary)
  useI18n('InformationRequests.InformationRequestList')
  const { t } = useTranslation('InformationRequests.InformationRequestList')
  const { Heading, Text, Button, Badge } = useComponentContext()

  const { data } = useInformationRequestsGetInformationRequestsSuspense({
    companyUuid: companyId,
  })

  const informationRequests = data.informationRequestList ?? []

  const visibleRequests = informationRequests.filter(request => {
    const isNotApproved = request.status !== InformationRequestStatus.Approved

    if (filterByPayrollBlocking) {
      return request.blockingPayroll && isNotApproved
    }

    return isNotApproved
  })

  const getTypeLabel = (type: InformationRequest['type']): string => {
    switch (type) {
      case InformationRequestType.CompanyOnboarding:
        return t('types.companyOnboarding')
      case InformationRequestType.AccountProtection:
        return t('types.accountProtection')
      case InformationRequestType.PaymentRequest:
        return t('types.paymentRequest')
      case InformationRequestType.PaymentError:
        return t('types.paymentError')
      default:
        return t('types.unknown')
    }
  }

  const getStatusMapping = (status: InformationRequest['status']): StatusMapping => {
    switch (status) {
      case InformationRequestStatus.PendingResponse:
        return { label: t('status.incomplete'), badgeStatus: 'info' }
      case InformationRequestStatus.PendingReview:
        return { label: t('status.underReview'), badgeStatus: 'warning' }
      default:
        return null
    }
  }

  const dataViewProps = useDataView({
    data: visibleRequests,
    emptyState: () => (
      <EmptyData title={t('emptyTableTitle')} description={t('emptyTableDescription')} />
    ),
    columns: [
      {
        key: 'type',
        title: t('columns.type'),
        render: request => (
          <FlexItem flexGrow={1}>
            <Text weight="medium">{getTypeLabel(request.type)}</Text>
          </FlexItem>
        ),
      },
      {
        key: 'status',
        title: t('columns.status'),
        render: request => {
          const statusMapping = getStatusMapping(request.status)
          const showPayrollBlockingBadge = !filterByPayrollBlocking && request.blockingPayroll

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
            onEvent(informationRequestEvents.INFORMATION_REQUEST_RESPOND, {
              requestId: request.uuid,
            })
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
        {visibleRequests.length > 0 && <Text>{t('description')}</Text>}
      </Flex>

      <DataView {...dataViewProps} label={t('title')} />
    </Flex>
  )
}
