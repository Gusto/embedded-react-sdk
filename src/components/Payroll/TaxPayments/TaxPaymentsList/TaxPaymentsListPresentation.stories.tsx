import { useState } from 'react'
import { fn } from 'storybook/test'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import type { TaxPayment } from '@gusto/embedded-api/models/components/taxpayment'
import type { TaxPaymentRow } from './TaxPaymentsListPresentation'
import { TaxPaymentsListPresentation } from './TaxPaymentsListPresentation'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'

export default {
  title: 'Domain/Payroll/TaxPayments/TaxPaymentsList',
}

const createPayment = (overrides: Partial<TaxPayment>): TaxPayment => ({
  uuid: 'tax-payment-1',
  companyUuid: 'company-1',
  agencyName: 'Internal Revenue Service',
  jurisdiction: 'US',
  periodStart: new RFCDate('2026-09-01'),
  periodEnd: new RFCDate('2026-09-30'),
  dueDate: new RFCDate('2026-10-15'),
  paymentSentOn: null,
  amount: '14661.36',
  amountPaid: '0.00',
  ...overrides,
})

const overduePayment = createPayment({
  uuid: 'tax-payment-2',
  agencyName: 'Employment Development Department',
  jurisdiction: 'CA',
  periodStart: new RFCDate('2026-07-01'),
  periodEnd: new RFCDate('2026-09-30'),
  dueDate: new RFCDate('2026-09-15'),
  amount: '1536.67',
})

const rows: TaxPaymentRow[] = [
  { payment: createPayment({}), status: 'scheduled' },
  { payment: overduePayment, status: 'overdue' },
  {
    payment: createPayment({
      uuid: 'tax-payment-3',
      dueDate: new RFCDate('2026-09-15'),
      paymentSentOn: new RFCDate('2026-09-14'),
      amount: '7330.71',
      amountPaid: '7330.71',
    }),
    status: 'paid',
  },
  {
    payment: createPayment({ uuid: 'tax-payment-4', amount: '-212.20' }),
    status: 'refund',
  },
]

const pagination = (totalCount: number): PaginationControlProps => ({
  currentPage: 1,
  totalPages: 1,
  totalCount,
  itemsPerPage: 10,
  handleFirstPage: fn().mockName('handleFirstPage'),
  handlePreviousPage: fn().mockName('handlePreviousPage'),
  handleNextPage: fn().mockName('handleNextPage'),
  handleLastPage: fn().mockName('handleLastPage'),
  handleItemsPerPageChange: fn().mockName('handleItemsPerPageChange'),
})

function Story({
  storyRows,
  hasPayments = true,
}: {
  storyRows: TaxPaymentRow[]
  hasPayments?: boolean
}) {
  const [searchValue, setSearchValue] = useState('')
  const [jurisdictionFilter, setJurisdictionFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  return (
    <TaxPaymentsListPresentation
      rows={storyRows}
      overdueCount={storyRows.filter(({ status }) => status === 'overdue').length}
      jurisdictions={['US', 'CA']}
      hasPayments={hasPayments}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      jurisdictionFilter={jurisdictionFilter}
      onJurisdictionFilterChange={setJurisdictionFilter}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      pagination={pagination(storyRows.length)}
      onViewPayment={fn().mockName('onViewPayment')}
    />
  )
}

export const Default = () => <Story storyRows={rows} />

export const NoOverdue = () => (
  <Story storyRows={rows.filter(({ status }) => status !== 'overdue')} />
)

export const Empty = () => <Story storyRows={[]} hasPayments={false} />

export const NoMatchingResults = () => <Story storyRows={[]} />
