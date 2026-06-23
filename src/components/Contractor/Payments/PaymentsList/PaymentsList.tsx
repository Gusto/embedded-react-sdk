import { useState, useMemo, useCallback } from 'react'
import { useContractorPaymentGroupsGetListSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/contractorPaymentGroupsGetList'
import { useInformationRequestsGetInformationRequestsSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/informationRequestsGetInformationRequests'
import { InformationRequestStatus } from '@gusto/embedded-api-v-2026-02-01/models/components/informationrequest'
import type { InternalAlert } from '../types'
import { PaymentsListPresentation } from './PaymentsListPresentation'
import { useComponentDictionary } from '@/i18n'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { componentEvents } from '@/shared/constants'
import { usePagination } from '@/hooks/usePagination/usePagination'

/**
 * Props for {@link PaymentsList}.
 *
 * @public
 */
export interface PaymentsListProps extends BaseComponentInterface<'Contractor.Payments.PaymentsList'> {
  /** UUID of the company whose contractor payment groups should be listed. */
  companyId: string
  /**
   * @internal
   * Flow-injected alerts (e.g. wire-transfer confirmation, payment cancellation).
   */
  alerts?: InternalAlert[]
}

/**
 * Displays a list of contractor payment groups for a company.
 *
 * Supports viewing payment history, creating new payments, and filtering by date range.
 * Surfaces alerts for pending information requests and wire transfer requirements.
 *
 * @remarks
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/payments/create` | User chooses to create a new payment | — |
 * | `contractor/payments/view` | User selects a payment group to view | `{ paymentId: string }` |
 * | `contractor/payments/rfi/respond` | User clicks to respond to an information request alert | — |
 *
 * @param props - Component props.
 * @returns The rendered payments list.
 * @public
 */
export function PaymentsList(props: PaymentsListProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const calculateDateRange = (months: number = 3) => {
  const endDate = new Date()
  const startDate = new Date()

  startDate.setMonth(startDate.getMonth() - months)
  //Max range allowed by the API is 12 months
  endDate.setMonth(endDate.getMonth() + (12 - months))

  return {
    startDate: startDate.toISOString().split('T')[0] || '',
    endDate: endDate.toISOString().split('T')[0] || '',
  }
}

const Root = ({ companyId, dictionary, onEvent, alerts }: PaymentsListProps) => {
  useComponentDictionary('Contractor.Payments.PaymentsList', dictionary)

  const [numberOfMonths, setNumberOfMonths] = useState(3)
  const { currentPage, itemsPerPage, getPaginationProps } = usePagination()

  const { startDate, endDate } = useMemo(() => calculateDateRange(numberOfMonths), [numberOfMonths])

  const { data } = useContractorPaymentGroupsGetListSuspense({
    companyId,
    startDate,
    endDate,
    page: currentPage,
    per: itemsPerPage,
  })
  const contractorPayments = data.contractorPaymentGroupWithBlockers || []
  const paginationProps = getPaginationProps(data.httpMeta.response.headers)

  const { data: informationRequestsData } = useInformationRequestsGetInformationRequestsSuspense({
    companyUuid: companyId,
  })
  const informationRequests = informationRequestsData.informationRequests ?? []

  const hasUnresolvedWireInRequests = useMemo(() => {
    return contractorPayments.some(payment => {
      const creditBlockers = payment.creditBlockers || []
      return creditBlockers.some(blocker => {
        if (blocker.status !== 'unresolved') return false
        const wireOption = blocker.unblockOptions?.find(
          option => option.unblockType === 'submit_wire',
        )
        return wireOption && 'metadata' in wireOption && wireOption.metadata.wireInRequestUuid
      })
    })
  }, [contractorPayments])

  const handleRespondToRfi = useCallback(() => {
    onEvent(componentEvents.CONTRACTOR_PAYMENT_RFI_RESPOND)
  }, [onEvent])

  const rfiAlerts = useMemo(() => {
    const rfiAlertsArray: InternalAlert[] = []

    const hasPendingResponseRfis = informationRequests.some(
      request => request.status === InformationRequestStatus.PendingResponse,
    )
    const hasPendingReviewRfis = informationRequests.some(
      request => request.status === InformationRequestStatus.PendingReview,
    )

    if (hasPendingResponseRfis) {
      rfiAlertsArray.push({
        type: 'error',
        title: 'rfiPendingResponseTitle',
        content: 'rfiPendingResponseDescription',
        onAction: handleRespondToRfi,
        actionLabel: 'rfiRespondCta',
      })
    } else if (hasPendingReviewRfis) {
      rfiAlertsArray.push({
        type: 'info',
        title: 'rfiPendingReviewTitle',
        content: 'rfiPendingReviewDescription',
      })
    }

    return rfiAlertsArray
  }, [informationRequests, handleRespondToRfi])

  const onCreatePayment = () => {
    onEvent(componentEvents.CONTRACTOR_PAYMENT_CREATE)
  }

  const handleDateRangeChange = (numberOfMonths: number) => {
    setNumberOfMonths(numberOfMonths)
  }

  const onViewPayment = (paymentId: string) => {
    onEvent(componentEvents.CONTRACTOR_PAYMENT_VIEW, { paymentId })
  }

  const allAlerts = useMemo(() => {
    return [...rfiAlerts, ...(alerts || [])]
  }, [rfiAlerts, alerts])

  return (
    <PaymentsListPresentation
      contractorPayments={contractorPayments}
      numberOfMonths={numberOfMonths}
      onCreatePayment={onCreatePayment}
      onDateRangeChange={handleDateRangeChange}
      onViewPayment={onViewPayment}
      alerts={allAlerts}
      companyId={companyId}
      hasUnresolvedWireInRequests={hasUnresolvedWireInRequests}
      onEvent={onEvent}
      paginationProps={paginationProps}
    />
  )
}
