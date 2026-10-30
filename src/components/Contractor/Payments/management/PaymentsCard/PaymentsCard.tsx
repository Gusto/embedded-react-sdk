import { useTranslation } from 'react-i18next'
import {
  useContractorPaymentsList,
  type ContractorPaymentHistoryEntry,
} from '../../shared/useContractorPaymentsList'
import { getContractorPaymentTotalAmount } from '../../shared/paymentAmounts'
import { DataView, EmptyData, useDataView, Loading } from '@/components/Common'
import { BaseBoundaries, BaseLayout } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import type { LoaderComponentType } from '@/components/Base'

/**
 * Props for {@link PaymentsCard}.
 *
 * @public
 */
export interface PaymentsCardProps {
  /** The associated contractor identifier. */
  contractorId: string
  /** Event handler fired when the user asks to see all payments or selects a single payment. */
  onEvent: OnEventType<EventType, unknown>
  /** Custom loading indicator rendered while this component's async data is fetching. Overrides the indicator configured on `GustoProvider` for this instance only. */
  LoaderComponent?: LoaderComponentType
}

/**
 * Standalone read-only "Recent payments" card for a single contractor.
 *
 * @remarks
 * Fetches its own data via {@link useContractorPaymentsList} and renders the
 * contractor's payment history — most recent first — with the payment date,
 * total, payment method, and funding status. Read-only: creating and cancelling
 * payments happen elsewhere, so this surface only emits events for the host to
 * route on.
 *
 * The underlying endpoint returns **cancelled payments alongside active ones**
 * and exposes no field distinguishing them (`status` is only `Funded` or
 * `Unfunded`), so cancelled payments appear in this list. Note that fetching a
 * cancelled payment by UUID responds `404`, so a handler that routes
 * `paymentSelected` to a payment-detail surface should expect that case.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/management/payments/card/viewAllRequested` | Fired when the header's "View all" button is clicked | `{ contractorId: string }` |
 * | `contractor/management/payments/card/paymentSelected` | Fired when a row's "View details" action is clicked | `{ contractorId: string, payment: ContractorPaymentHistoryEntry }` |
 *
 * @param props - See {@link PaymentsCardProps}.
 * @returns The contractor recent-payments card.
 * @public
 *
 * @example
 * ```tsx
 * import { ContractorManagement } from '@gusto/embedded-react-sdk'
 *
 * <ContractorManagement.PaymentsCard contractorId="contractor-uuid" onEvent={() => {}} />
 * ```
 */
export function PaymentsCard({ LoaderComponent, ...props }: PaymentsCardProps) {
  return (
    <BaseBoundaries
      componentName="Contractor.Management.Payments"
      LoaderComponent={LoaderComponent}
    >
      <PaymentsCardContent LoaderComponent={LoaderComponent} {...props} />
    </BaseBoundaries>
  )
}

function PaymentsCardContent({ contractorId, onEvent, LoaderComponent }: PaymentsCardProps) {
  useI18n('Contractor.Management.Payments')
  const { t } = useTranslation('Contractor.Management.Payments')
  const Components = useComponentContext()
  const { formatLongWithYear } = useDateFormatter()
  const formatCurrency = useNumberFormatter('currency')

  const paymentsList = useContractorPaymentsList({ contractorId })

  const isLoading = paymentsList.isLoading
  const payments = paymentsList.isLoading ? [] : paymentsList.data.payments
  const pagination = paymentsList.isLoading ? undefined : paymentsList.pagination.payments
  const isShowingTable = payments.length > 0

  const columns = [
    {
      key: 'checkDate',
      title: t('paymentDateColumn'),
      render: (payment: ContractorPaymentHistoryEntry) =>
        formatLongWithYear(payment.checkDate?.toString()) || t('emptyPlaceholder'),
    },
    {
      key: 'total',
      title: t('totalColumn'),
      justify: 'end' as const,
      render: (payment: ContractorPaymentHistoryEntry) =>
        formatCurrency(getContractorPaymentTotalAmount(payment)),
    },
    {
      key: 'paymentMethod',
      title: t('paymentMethodColumn'),
      render: (payment: ContractorPaymentHistoryEntry) =>
        payment.paymentMethod ?? t('emptyPlaceholder'),
    },
    {
      key: 'status',
      title: t('statusColumn'),
      render: (payment: ContractorPaymentHistoryEntry) => {
        if (!payment.status) return t('emptyPlaceholder')
        return payment.status === 'Funded' ? (
          <Components.Badge status="success">{t('status.funded')}</Components.Badge>
        ) : (
          <Components.Badge status="warning">{t('status.unfunded')}</Components.Badge>
        )
      },
    },
  ]

  const dataViewProps = useDataView({
    data: payments,
    columns,
    pagination,
    itemMenu: payment => (
      <Components.Button
        variant="secondary"
        onClick={() => {
          onEvent(componentEvents.CONTRACTOR_MANAGEMENT_PAYMENTS_CARD_PAYMENT_SELECTED, {
            contractorId,
            payment,
          })
        }}
      >
        {t('viewDetailsCta')}
      </Components.Button>
    ),
    emptyState: () => (
      <EmptyData title={t('emptyState.title')} description={t('emptyState.description')} />
    ),
  })

  return (
    <BaseLayout error={paymentsList.errorHandling.errors} LoaderComponent={LoaderComponent}>
      <Components.Box
        withPadding={!isShowingTable}
        header={
          <Components.BoxHeader
            title={t('title')}
            action={
              isShowingTable ? (
                <Components.Button
                  variant="secondary"
                  onClick={() => {
                    onEvent(
                      componentEvents.CONTRACTOR_MANAGEMENT_PAYMENTS_CARD_VIEW_ALL_REQUESTED,
                      {
                        contractorId,
                      },
                    )
                  }}
                >
                  {t('viewAllCta')}
                </Components.Button>
              ) : null
            }
          />
        }
      >
        {isLoading ? (
          <Loading />
        ) : isShowingTable ? (
          <DataView label={t('listLabel')} isWithinBox {...dataViewProps} />
        ) : (
          <EmptyData title={t('emptyState.title')} description={t('emptyState.description')} />
        )}
      </Components.Box>
    </BaseLayout>
  )
}
