import { useTranslation } from 'react-i18next'
import { useInformationRequestsGetInformationRequestsSuspense } from '@gusto/embedded-api/react-query/informationRequestsGetInformationRequests'
import type { InformationRequest } from '@gusto/embedded-api/models/components/informationrequest'
import {
  InformationRequestStatus,
  InformationRequestType,
} from '@gusto/embedded-api/models/components/informationrequest'
import { informationRequestEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import type { BadgeProps } from '@/components/Common/UI/Badge/BadgeTypes'

type StatusMapping = {
  label: string
  badgeStatus: BadgeProps['status']
} | null

interface UseInformationRequestListParams {
  companyId: string
  filterByPayrollBlocking?: boolean
  onEvent: OnEventType<EventType, unknown>
}

export function useInformationRequestList({
  companyId,
  filterByPayrollBlocking = false,
  onEvent,
}: UseInformationRequestListParams) {
  const { t } = useTranslation('InformationRequests.InformationRequestList')

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

  const handleRespond = (requestId: InformationRequest['uuid']) => {
    onEvent(informationRequestEvents.INFORMATION_REQUEST_RESPOND, { requestId })
  }

  return {
    data: {
      informationRequests,
      visibleRequests,
    },
    actions: {
      handleRespond,
    },
    meta: {
      filterByPayrollBlocking,
      getTypeLabel,
      getStatusMapping,
    },
  }
}
