import { useState, useMemo } from 'react'
import type { PayrollOption, EmployeeOption } from './types'
import { StepProgress } from './StepProgress'
import styles from './PayrollReversalsFlow.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { DataView, Flex, useDataView } from '@/components/Common'
import SearchIcon from '@/assets/icons/search-lg.svg?react'

interface SelectEmployeesStepProps {
  payroll: PayrollOption
  employees: EmployeeOption[]
  onContinue: (selectedUuids: string[]) => void
  onBack: () => void
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

export function SelectEmployeesStep({
  payroll,
  employees,
  onContinue,
  onBack,
}: SelectEmployeesStepProps) {
  const Components = useComponentContext()
  const [search, setSearch] = useState('')
  const [selectedUuids, setSelectedUuids] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return employees
    return employees.filter(
      e =>
        e.firstName.toLowerCase().includes(q) ||
        e.lastName.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q),
    )
  }, [employees, search])

  const dataViewProps = useDataView<EmployeeOption>({
    data: filtered,
    columns: [
      {
        key: 'firstName',
        title: 'Employee',
        render: e => (
          <Components.Text as="span" size="sm">
            {e.firstName} {e.lastName}
          </Components.Text>
        ),
      },
      {
        key: 'department',
        title: 'Department',
        render: e => (
          <Components.Text as="span" size="sm" variant="supporting">
            {e.department}
          </Components.Text>
        ),
      },
      {
        key: 'netPay',
        title: 'Net pay',
        render: e => (
          <Components.Text as="span" size="sm" variant="supporting">
            {e.netPay}
          </Components.Text>
        ),
      },
    ],
    selectionMode: 'multiple',
    getIsItemSelected: e => selectedUuids.has(e.uuid),
    onSelect: (e, checked) => {
      setSelectedUuids(prev => {
        const next = new Set(prev)
        checked ? next.add(e.uuid) : next.delete(e.uuid)
        return next
      })
    },
    onSelectAll: checked => {
      setSelectedUuids(checked ? new Set(filtered.map(e => e.uuid)) : new Set())
    },
    emptyState: () => (
      <Flex flexDirection="column" alignItems="center" gap={8}>
        <Components.Text variant="supporting" size="sm">
          No employees match your search.
        </Components.Text>
      </Flex>
    ),
  })

  const handleContinue = () => {
    onContinue(Array.from(selectedUuids))
  }

  return (
    <Flex flexDirection="column" gap={24}>
      <StepProgress current={2} total={3} label="Select employees" />

      <Flex flexDirection="column" gap={4}>
        <Components.Heading as="h2">Select employees to reverse</Components.Heading>
        <Components.Text variant="supporting" size="sm">
          Payroll: {formatDateRange(payroll.payPeriodStart, payroll.payPeriodEnd)} (check date{' '}
          {formatCheckDate(payroll.checkDate)})
        </Components.Text>
      </Flex>

      <Components.Text variant="supporting" size="sm">
        Select specific employees to include in the reversal, or leave all unselected to reverse
        the entire payroll. Reversing all employees will affect all {payroll.employeeCount}{' '}
        employees in this payroll run.
      </Components.Text>

      <div className={styles.searchRow}>
        <Components.TextInput
          label="Search employees"
          shouldVisuallyHideLabel
          placeholder="Search by name or department..."
          type="search"
          value={search}
          onChange={setSearch}
          adornmentStart={<SearchIcon aria-hidden />}
        />
      </div>

      <DataView label="Employees in payroll" {...dataViewProps} />

      <div className={styles.actionRow}>
        <Components.Button variant="primary" onClick={handleContinue}>
          Continue to review
        </Components.Button>
        <Components.Button variant="secondary" onClick={onBack}>
          Back
        </Components.Button>
      </div>
    </Flex>
  )
}
