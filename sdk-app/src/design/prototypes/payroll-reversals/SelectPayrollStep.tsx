import type { PayrollOption } from './types'
import { StepProgress } from './StepProgress'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { DataView, Flex, useDataView } from '@/components/Common'

interface SelectPayrollStepProps {
  payrolls: PayrollOption[]
  onSelectPayroll: (payroll: PayrollOption) => void
  onCancel: () => void
}

function formatDateRange(start: string, end: string): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${fmt(start)} – ${fmt(end)}`
}

function formatCheckDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDeadline(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  })
}

export function SelectPayrollStep({ payrolls, onSelectPayroll, onCancel }: SelectPayrollStepProps) {
  const Components = useComponentContext()

  const dataViewProps = useDataView<PayrollOption>({
    data: payrolls,
    columns: [
      {
        key: 'payPeriodStart',
        title: 'Pay period',
        render: p => (
          <Components.Text as="span" size="sm">
            {formatDateRange(p.payPeriodStart, p.payPeriodEnd)}
          </Components.Text>
        ),
      },
      {
        key: 'checkDate',
        title: 'Check date',
        render: p => (
          <Components.Text as="span" size="sm" variant="supporting">
            {formatCheckDate(p.checkDate)}
          </Components.Text>
        ),
      },
      {
        key: 'type',
        title: 'Type',
        render: p => (
          <Components.Text as="span" size="sm" variant="supporting">
            {p.type}
          </Components.Text>
        ),
      },
      {
        key: 'employeeCount',
        title: 'Employees',
        render: p => (
          <Components.Text as="span" size="sm" variant="supporting">
            {p.employeeCount}
          </Components.Text>
        ),
      },
      {
        key: 'totalAmount',
        title: 'Total amount',
        render: p => (
          <Components.Text as="span" size="sm" variant="supporting">
            {p.totalAmount}
          </Components.Text>
        ),
      },
      {
        key: 'fundRecoveryStatus',
        title: 'Fund recovery',
        render: p =>
          p.fundRecoveryStatus === 'eligible' ? (
            <Flex flexDirection="column" gap={2}>
              <Components.Badge status="success">Eligible</Components.Badge>
              {p.fundRecoveryDeadline && (
                <Components.Text as="span" size="sm" variant="supporting">
                  Deadline: {formatDeadline(p.fundRecoveryDeadline)}
                </Components.Text>
              )}
            </Flex>
          ) : (
            <Components.Badge status="info">Window closed</Components.Badge>
          ),
      },
    ],
    itemMenu: p => (
      <Components.Button
        variant="tertiary"
        onClick={() => {
          onSelectPayroll(p)
        }}
      >
        Select payroll
      </Components.Button>
    ),
  })

  return (
    <Flex flexDirection="column" gap={24}>
      <StepProgress current={1} total={3} label="Select payroll" />

      <Flex flexDirection="column" gap={8}>
        <Components.Heading as="h2">Select a payroll to reverse</Components.Heading>
        <Components.Text variant="supporting" size="sm">
          Choose the payroll run you want to reverse. Only payrolls from the last 90 days are
          shown. Reversals cannot be undone once submitted — review all details carefully before
          proceeding.
        </Components.Text>
      </Flex>

      <DataView label="Payrolls available for reversal" {...dataViewProps} />

      <div>
        <Components.Button variant="secondary" onClick={onCancel}>
          Cancel
        </Components.Button>
      </div>
    </Flex>
  )
}
