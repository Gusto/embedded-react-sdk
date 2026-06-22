import { useMemo, useState } from 'react'
import type { ContractorOption, HistoricalContractorPayment } from '../types'
import { computePaymentTotal } from '../types'
import { EditContractorPaymentModal } from './EditContractorPaymentModal'
import { DataView, EmptyData, Flex, FlexItem } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface HistoricalPaymentConfigurationProps {
  contractors: ContractorOption[]
  payments: HistoricalContractorPayment[]
  onUpdatePayment: (payment: HistoricalContractorPayment) => void
  onContinue: () => void
  onBack?: () => void
}

interface TableRow {
  payment: HistoricalContractorPayment
  contractor: ContractorOption
}

const ZERO_HOURS_DISPLAY = '0.000'

export function HistoricalPaymentConfiguration({
  contractors,
  payments,
  onUpdatePayment,
  onContinue,
  onBack,
}: HistoricalPaymentConfigurationProps) {
  const Components = useComponentContext()
  const [editingContractorId, setEditingContractorId] = useState<string | null>(null)

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

  const editingRow = editingContractorId
    ? (rows.find(row => row.contractor.id === editingContractorId) ?? null)
    : null

  return (
    <Flex flexDirection="column" gap={32}>
      <Flex justifyContent="space-between" alignItems="center" gap={16}>
        <Flex flexDirection="column" gap={4}>
          <Components.Heading as="h2">Hours and payments</Components.Heading>
          <Components.Text variant="supporting">
            Enter the hours or wage paid to each contractor along with any bonuses and
            reimbursements.
          </Components.Text>
        </Flex>
        <Flex gap={8} justifyContent="flex-end">
          {onBack && (
            <Components.Button variant="secondary" onClick={onBack}>
              Back
            </Components.Button>
          )}

          <Components.Button onClick={onContinue}>Continue</Components.Button>
        </Flex>
      </Flex>

      <DataView
        label="Hours and payments"
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
        itemMenu={({ contractor }) => (
          <HamburgerMenu
            items={[
              {
                label: 'Edit contractor payment',
                onClick: () => {
                  setEditingContractorId(contractor.id)
                },
              },
            ]}
            triggerLabel="Edit contractor payment"
          />
        )}
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
            title="No contractors selected"
            description="Go back and select at least one contractor."
          />
        )}
      />

      <EditContractorPaymentModal
        isOpen={editingRow !== null}
        contractor={editingRow?.contractor ?? null}
        initialPayment={editingRow?.payment ?? null}
        onClose={() => {
          setEditingContractorId(null)
        }}
        onSave={onUpdatePayment}
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
