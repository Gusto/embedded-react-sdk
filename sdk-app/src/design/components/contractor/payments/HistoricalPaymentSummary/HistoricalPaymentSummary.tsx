import { useMemo } from 'react'
import { computePaymentTotal } from '../types'
import type { ContractorOption, HistoricalContractorPayment } from '../types'
import { DataView, EmptyData, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface HistoricalPaymentSummaryProps {
  contractors: ContractorOption[]
  payments: HistoricalContractorPayment[]
  paidDate: string
  isSubmitting?: boolean
  onSubmit: () => void
  onBack?: () => void
}

interface TableRow {
  payment: HistoricalContractorPayment
  contractor: ContractorOption
}

const ZERO_HOURS_DISPLAY = '0.000'

export function HistoricalPaymentSummary({
  contractors,
  payments,
  paidDate,
  isSubmitting,
  onSubmit,
  onBack,
}: HistoricalPaymentSummaryProps) {
  const Components = useComponentContext()

  const rows = useMemo<TableRow[]>(() => {
    return payments
      .map(payment => {
        const contractor = contractors.find(c => c.id === payment.contractorId)
        return contractor ? { payment, contractor } : null
      })
      .filter((row): row is TableRow => row !== null)
  }, [payments, contractors])

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, { payment, contractor }) => {
        const wage =
          contractor.wageType === 'Hourly'
            ? Number(payment.hours || '0') * Number(contractor.hourlyRate || '0')
            : Number(payment.wage || '0')
        acc.wage += wage
        acc.bonus += Number(payment.bonus || '0')
        acc.reimbursement += Number(payment.reimbursement || '0')
        acc.total += computePaymentTotal(payment, contractor)
        return acc
      },
      { wage: 0, bonus: 0, reimbursement: 0, total: 0 },
    )
  }, [rows])

  return (
    <Flex flexDirection="column" gap={32}>
      <Flex justifyContent="space-between" alignItems="center" gap={16}>
        <Flex flexDirection="column" gap={4}>
          <Components.Heading as="h2">Review and submit</Components.Heading>
          <Components.Text variant="supporting">
            Historical payment for {formatDate(paidDate)}
          </Components.Text>
        </Flex>
        <Flex gap={8} justifyContent="flex-end">
          {onBack && (
            <Components.Button variant="secondary" onClick={onBack}>
              Back
            </Components.Button>
          )}
          <Components.Button onClick={onSubmit} isLoading={isSubmitting}>
            Submit historical payment
          </Components.Button>
        </Flex>
      </Flex>

      <DataView
        label="Contractor payments"
        data={rows}
        columns={[
          { title: 'Contractor', render: ({ contractor }) => contractor.name },
          {
            title: 'Wage type',
            render: ({ contractor }) =>
              contractor.wageType === 'Hourly' && contractor.hourlyRate
                ? `Hourly $${contractor.hourlyRate}/hr`
                : contractor.wageType,
          },
          { title: 'Payment method', render: () => 'Historical Payment' },
          {
            title: 'Hours',
            render: ({ payment, contractor }) =>
              contractor.wageType === 'Hourly' && Number(payment.hours || '0') > 0
                ? formatHours(Number(payment.hours))
                : ZERO_HOURS_DISPLAY,
          },
          {
            title: 'Wage',
            render: ({ payment, contractor }) =>
              formatCurrency(contractor.wageType === 'Fixed' ? Number(payment.wage || '0') : 0),
          },
          {
            title: 'Bonus',
            render: ({ payment }) => formatCurrency(Number(payment.bonus || '0')),
          },
          {
            title: 'Reimbursement',
            render: ({ payment }) => formatCurrency(Number(payment.reimbursement || '0')),
          },
          {
            title: 'Total',
            render: ({ payment, contractor }) =>
              formatCurrency(computePaymentTotal(payment, contractor)),
          },
        ]}
        footer={
          rows.length > 0
            ? () => ({
                'column-0': 'Totals',
                'column-4': formatCurrency(totals.wage),
                'column-5': formatCurrency(totals.bonus),
                'column-6': formatCurrency(totals.reimbursement),
                'column-7': formatCurrency(totals.total),
              })
            : undefined
        }
        emptyState={() => (
          <EmptyData
            title="Nothing to submit"
            description="Go back and configure at least one contractor payment."
          />
        )}
      />
    </Flex>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

function formatHours(value: number) {
  return value.toFixed(3)
}

function formatDate(isoDate: string) {
  if (!isoDate) return '—'
  const [year, month, day] = isoDate.split('-').map(Number)
  if (!year || !month || !day) return isoDate
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
