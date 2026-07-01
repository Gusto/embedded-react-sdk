import { useTranslation } from 'react-i18next'
import { useInformationRequestsGetInformationRequestsSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/informationRequestsGetInformationRequests'
import type { InformationRequest } from '@gusto/embedded-api-v-2026-02-01/models/components/informationrequest'
import {
  InformationRequestStatus,
  InformationRequestType,
} from '@gusto/embedded-api-v-2026-02-01/models/components/informationrequest'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { DataView } from '@/components/Common/DataView/DataView'
import { useDataView } from '@/components/Common/DataView/useDataView'
import { EmptyData, Flex, FlexItem } from '@/components/Common'
import { informationRequestEvents } from '@/shared/constants'
import type { BadgeProps } from '@/components/Common/UI/Badge/BadgeTypes'

/**
 * Props for {@link InformationRequestList}.
 *
 * @public
 */
export interface InformationRequestListProps extends BaseComponentInterface<'InformationRequests.InformationRequestList'> {
  /** The associated company identifier. */
  companyId: string
  /** Event callback. See the events table on {@link InformationRequestList} for emitted events. */
  onEvent: BaseComponentInterface['onEvent']
}

/**
 * Displays the list of outstanding information requests for a company with a "Respond" CTA on each open request.
 *
 * @remarks
 * Renders status badges for each request and an extra "Payroll blocking" badge when the request is currently blocking payroll. Approved requests are filtered out of the list. Used as the top-level surface of `InformationRequests.InformationRequestsFlow`, but can be rendered directly when you want to host the response form yourself (e.g. in a custom modal or page).
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `informationRequest/respond` | Fired when the user clicks "Respond" on an open request | `{ requestId: string }` |
 *
 * @param props - See {@link InformationRequestListProps}.
 * @returns The rendered information request list.
 * @public
 */
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

function Root({ companyId, dictionary, onEvent }: InformationRequestListProps) {
  useComponentDictionary('InformationRequests.InformationRequestList', dictionary)
  useI18n('InformationRequests.InformationRequestList')
  const { t } = useTranslation('InformationRequests.InformationRequestList')
  const { Heading, Text, Button, Badge } = useComponentContext()

  const { data } = useInformationRequestsGetInformationRequestsSuspense({
    companyUuid: companyId,
  })

  const informationRequests = data.informationRequests ?? []

  const visibleRequests = informationRequests.filter(
    request => request.status !== InformationRequestStatus.Approved,
  )

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
          const showPayrollBlockingBadge = request.blockingPayroll

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
