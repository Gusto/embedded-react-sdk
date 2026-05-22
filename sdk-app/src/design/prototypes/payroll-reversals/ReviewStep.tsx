import { useState } from 'react'
import type { PayrollOption, EmployeeOption } from './types'
import { StepProgress } from './StepProgress'
import styles from './PayrollReversalsFlow.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'

interface ReviewStepProps {
  payroll: PayrollOption
  selectedEmployeeUuids: string[]
  allEmployees: EmployeeOption[]
  onSubmit: () => void
  onBack: () => void
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

function parseNetPay(netPay: string): number {
  return parseFloat(netPay.replace(/[$,]/g, ''))
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function ReviewStep({
  payroll,
  selectedEmployeeUuids,
  allEmployees,
  onSubmit,
  onBack,
  onCancel,
}: ReviewStepProps) {
  const Components = useComponentContext()
  const [confirmed, setConfirmed] = useState(false)

  const isAllEmployees = selectedEmployeeUuids.length === 0
  const selectedEmployees = isAllEmployees
    ? allEmployees
    : allEmployees.filter(e => selectedEmployeeUuids.includes(e.uuid))

  const totalAmount = selectedEmployees.reduce((sum, e) => sum + parseNetPay(e.netPay), 0)

  const employeesLabel = isAllEmployees
    ? `All ${payroll.employeeCount} employees`
    : selectedEmployees.length === 1
      ? `1 of ${payroll.employeeCount} — ${selectedEmployees[0]!.firstName} ${selectedEmployees[0]!.lastName}`
      : `${selectedEmployees.length} of ${payroll.employeeCount}`

  const reversalTypeLabel =
    payroll.fundRecoveryStatus === 'eligible'
      ? 'Full reversal with fund recovery'
      : 'Records-only reversal (no fund recovery)'

  return (
    <Flex flexDirection="column" gap={24}>
      <StepProgress current={3} total={3} label="Review and confirm" />

      <Flex flexDirection="column" gap={8}>
        <Components.Heading as="h2">Review and confirm reversal</Components.Heading>
      </Flex>

      {payroll.fundRecoveryStatus === 'eligible' ? (
        <Components.Alert
          status="info"
          label="Gusto will attempt to recover funds from employee bank accounts"
        >
          <Components.Text size="sm">
            Because this payroll&apos;s fund recovery window is still open, Gusto will submit an
            ACH reversal request to attempt to pull back the deposited funds. Recovery is not
            guaranteed — employees may have already withdrawn funds. The deadline to initiate fund
            recovery is{' '}
            <strong>{payroll.fundRecoveryDeadline ? formatDeadline(payroll.fundRecoveryDeadline) : 'soon'}</strong>
            .
          </Components.Text>
        </Components.Alert>
      ) : (
        <Components.Alert
          status="info"
          label="The fund recovery window has passed — no funds will be recovered"
        >
          <Components.Text size="sm">
            The 5-business-day window for ACH fund recovery has closed. This reversal will correct
            your payroll records and trigger amended tax filings, but employees will keep the funds
            they received. You may need to arrange a separate repayment process with affected
            employees.
          </Components.Text>
        </Components.Alert>
      )}

      <Components.Box
        header={<Components.BoxHeader title="Reversal summary" />}
      >
        <div className={styles.summaryBox}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryTerm}>Payroll</span>
            <span className={styles.summaryDescription}>
              {formatDateRange(payroll.payPeriodStart, payroll.payPeriodEnd)}
            </span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryTerm}>Check date</span>
            <span className={styles.summaryDescription}>{formatCheckDate(payroll.checkDate)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryTerm}>Reversal type</span>
            <span className={styles.summaryDescription}>{reversalTypeLabel}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryTerm}>Employees</span>
            <span className={styles.summaryDescription}>{employeesLabel}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryTerm}>Estimated reversal total</span>
            <span className={styles.summaryDescription}>{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </Components.Box>

      <div className={styles.checkboxRow}>
        <Components.Checkbox
          label="By checking this box, you confirm that you understand this action cannot be undone and that you have reviewed the reversal details above."
          value={confirmed}
          onChange={setConfirmed}
        />
      </div>

      <div className={styles.actionRow}>
        <Components.Button variant="primary" onClick={onSubmit} isDisabled={!confirmed}>
          Submit reversal
        </Components.Button>
        <Components.Button variant="secondary" onClick={onBack}>
          Back
        </Components.Button>
        <Components.Button variant="tertiary" onClick={onCancel}>
          Cancel
        </Components.Button>
      </div>
    </Flex>
  )
}
