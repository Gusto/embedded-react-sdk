import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { DataView, Flex, useDataView } from '@/components/Common'
import type { ReversalRecord } from './types'
import { REVERSAL_CATEGORY_LABELS } from './types'
import { mockPayrolls } from './mockData'
import styles from './PayrollReversalsFlow.module.scss'

interface ReversalsListStepProps {
  reversals: ReversalRecord[]
  onStartNew: () => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function payrollLabel(r: ReversalRecord): string {
  if (r._payPeriodLabel) return r._payPeriodLabel
  const p = mockPayrolls.find(p => p.uuid === r.reversed_payroll_uuid)
  if (p) return `${formatDate(p.payPeriodStart)} – ${formatDate(p.payPeriodEnd)}`
  const uuid = r.reversed_payroll_uuid
  return uuid.length > 20 ? `${uuid.slice(0, 12)}…` : uuid
}

export function ReversalsListStep({ reversals, onStartNew }: ReversalsListStepProps) {
  const { Badge, Button, Heading, Text } = useComponentContext()

  const dataViewProps = useDataView<ReversalRecord>({
    data: reversals,
    columns: [
      {
        key: 'reversed_payroll_uuid',
        title: 'Reversed payroll',
        render: r => (
          <Text as="span" size="sm">
            {payrollLabel(r)}
          </Text>
        ),
      },
      {
        key: 'category',
        title: 'Category',
        render: r => (
          <Text as="span" size="sm">
            {r.category ? (REVERSAL_CATEGORY_LABELS[r.category] ?? r.category) : '—'}
          </Text>
        ),
      },
      {
        key: 'reversed_employee_uuids',
        title: 'Employees',
        render: r => (
          <Text as="span" size="sm" variant="supporting">
            {r.reversed_employee_uuids.length}
          </Text>
        ),
      },
      {
        key: 'approved_at',
        title: 'Approved',
        render: r => (
          <Text as="span" size="sm" variant="supporting">
            {r.approved_at ? formatDate(r.approved_at) : '—'}
          </Text>
        ),
      },
      {
        key: 'status',
        title: 'Status',
        render: r => (
          <Badge status={r.reversal_payroll_uuid ? 'success' : 'warning'}>
            {r.reversal_payroll_uuid ? 'Applied' : 'Pending'}
          </Badge>
        ),
      },
    ],
    emptyState: () => (
      <Flex flexDirection="column" alignItems="center" gap={8}>
        <Text variant="supporting" size="sm">
          No approved reversals found for this company.
        </Text>
      </Flex>
    ),
  })

  return (
    <Flex flexDirection="column" gap={24}>
      <Flex justifyContent="space-between" alignItems="flex-start">
        <Flex flexDirection="column" gap={8}>
          <Heading as="h2">Payroll Reversals</Heading>
          <Text variant="supporting" size="sm">
            Approved reversals for this company. Each reversal undoes a processed payroll run for
            one or more employees.
          </Text>
        </Flex>
        <div className={styles.newReversalButton}>
          <Button variant="primary" onClick={onStartNew}>
            New reversal
          </Button>
        </div>
      </Flex>

      <DataView label="Payroll reversals" {...dataViewProps} />
    </Flex>
  )
}
