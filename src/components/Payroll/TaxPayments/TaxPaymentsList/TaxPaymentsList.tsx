import { useMemo, useState } from 'react'
import { useAllTaxPayments } from '../shared/useAllTaxPayments'
import { deriveTaxPaymentStatus } from '../shared/taxPaymentStatus'
import { TaxPaymentsListPresentation, type TaxPaymentRow } from './TaxPaymentsListPresentation'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'
import { useClientPagination } from '@/hooks/useClientPagination/useClientPagination'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'
import { formatDateToStringDate } from '@/helpers/dateFormatting'

/**
 * Props for {@link TaxPaymentsList}.
 *
 * @alpha
 */
export interface TaxPaymentsListProps extends BaseComponentInterface<'Payroll.TaxPaymentsList'> {
  /** Identifier of the company whose tax payments are listed. */
  companyId: string
}

/**
 * Lists a company's tax payments with search, jurisdiction and status filters, and an alert for
 * overdue payments.
 *
 * @remarks
 * Requires the `taxPayments` flag in {@link UnstableFeatures}. Status is derived from each
 * payment's amounts and dates: `Paid`, `Scheduled`, `Overdue`, or `Refund / Credit`.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `payroll/taxPayments/view` | Fired when the user selects a tax payment to view | `{ taxPaymentId: string }` |
 *
 * @param props - See {@link TaxPaymentsListProps}.
 * @returns The rendered tax payments list.
 * @alpha
 */
export function TaxPaymentsList(props: TaxPaymentsListProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function matchesAgencySearch({ payment }: TaxPaymentRow, query: string): boolean {
  return (payment.agencyName ?? '').toLowerCase().includes(query.toLowerCase())
}

const Root = ({ companyId, className, dictionary, onEvent }: TaxPaymentsListProps) => {
  useUnstableFeature('taxPayments', { throwIfDisabled: true })
  useComponentDictionary('Payroll.TaxPaymentsList', dictionary)
  useI18n('Payroll.TaxPaymentsList')

  const payments = useAllTaxPayments(companyId)
  const [jurisdictionFilter, setJurisdictionFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const allRows = useMemo<TaxPaymentRow[]>(() => {
    const today = formatDateToStringDate(new Date()) ?? ''
    return payments
      .map(payment => ({ payment, status: deriveTaxPaymentStatus(payment, today) }))
      .sort((a, b) =>
        (b.payment.dueDate?.toString() ?? '').localeCompare(a.payment.dueDate?.toString() ?? ''),
      )
  }, [payments])

  const jurisdictions = useMemo(
    () => [...new Set(payments.flatMap(payment => payment.jurisdiction ?? []))],
    [payments],
  )

  const overdueCount = useMemo(
    () => allRows.filter(({ status }) => status === 'overdue').length,
    [allRows],
  )

  const filteredRows = useMemo(
    () =>
      allRows.filter(
        ({ payment, status }) =>
          (!jurisdictionFilter || payment.jurisdiction === jurisdictionFilter) &&
          (!statusFilter || status === statusFilter),
      ),
    [allRows, jurisdictionFilter, statusFilter],
  )

  const { data, pagination, searchValue, actions } = useClientPagination(filteredRows, {
    searchPredicate: matchesAgencySearch,
    defaultItemsPerPage: 10,
  })

  return (
    <TaxPaymentsListPresentation
      className={className}
      rows={data}
      overdueCount={overdueCount}
      jurisdictions={jurisdictions}
      hasPayments={payments.length > 0}
      searchValue={searchValue}
      onSearchChange={actions.onSearchChange}
      jurisdictionFilter={jurisdictionFilter}
      onJurisdictionFilterChange={setJurisdictionFilter}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      pagination={pagination}
      onViewPayment={taxPaymentId => {
        onEvent(componentEvents.TAX_PAYMENT_VIEW, { taxPaymentId })
      }}
    />
  )
}
