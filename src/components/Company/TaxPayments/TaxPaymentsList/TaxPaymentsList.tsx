import { useState } from 'react'
import { useAllTaxPayments } from '../shared/useAllTaxPayments'
import { ALL_FILTER_VALUE, deriveTaxPaymentStatus } from '../shared/taxPaymentStatus'
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
export interface TaxPaymentsListProps extends BaseComponentInterface<'Company.Management.TaxPaymentsList'> {
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
 * | `company/taxPayments/view` | Fired when the user selects a tax payment to view | `{ taxPaymentId: string }` |
 *
 * @param props - See {@link TaxPaymentsListProps}.
 * @returns The rendered tax payments list.
 * @alpha
 */
export function TaxPaymentsList(props: TaxPaymentsListProps) {
  useUnstableFeature('taxPayments', { throwIfDisabled: true })

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
  useComponentDictionary('Company.Management.TaxPaymentsList', dictionary)
  useI18n('Company.Management.TaxPaymentsList')

  const { taxPayments: payments, isTruncated } = useAllTaxPayments(companyId)
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>(ALL_FILTER_VALUE)
  const [statusFilter, setStatusFilter] = useState<string>(ALL_FILTER_VALUE)

  // Already ordered newest due date first by the server, so no client-side sort is needed. None of
  // these derivations are memoized: `payments` is a fresh array every render, so a memo keyed on it
  // could never hit, and these are cheap passes over a short list.
  const today = formatDateToStringDate(new Date()) ?? ''
  const allRows: TaxPaymentRow[] = payments.map(payment => ({
    payment,
    status: deriveTaxPaymentStatus(payment, today),
  }))

  const jurisdictions = [...new Set(payments.flatMap(payment => payment.jurisdiction ?? []))]

  const overdueCount = allRows.filter(({ status }) => status === 'overdue').length

  const filteredRows = allRows.filter(
    ({ payment, status }) =>
      (jurisdictionFilter === ALL_FILTER_VALUE || payment.jurisdiction === jurisdictionFilter) &&
      (statusFilter === ALL_FILTER_VALUE || status === statusFilter),
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
      isTruncated={isTruncated}
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
