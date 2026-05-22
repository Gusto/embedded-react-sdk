import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'
import styles from './PayrollReversalsFlow.module.scss'

interface WarningStepProps {
  onContinue: () => void
  onCancel: () => void
}

export function WarningStep({ onContinue, onCancel }: WarningStepProps) {
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={24}>
      <Flex flexDirection="column" gap={8}>
        <Components.Heading as="h2">Payroll reversal</Components.Heading>
        <Components.Text variant="supporting" size="sm">
          Before continuing, review when a reversal is — and isn&apos;t — the right tool.
        </Components.Text>
      </Flex>

      <div className={styles.warningBox}>
        <h3 className={styles.warningBoxTitle}>
          Reversals may cause late payments and tax complications
        </h3>
        <Components.Text size="sm">
          A payroll reversal cancels a completed payroll run and attempts to recover funds already
          deposited in employee bank accounts. This is a significant action that can disrupt
          employee pay schedules, trigger amended tax filings, and may require notifying employees
          about the reversal.
        </Components.Text>
        <div className={styles.warningBulletSection}>
          <p className={styles.warningBulletHeading}>Use a reversal when:</p>
          <ul className={styles.warningBulletList}>
            <li>The wrong employees were paid or an entirely incorrect payroll was run</li>
            <li>Employees were paid duplicate amounts due to a system error</li>
            <li>Payroll was run for a pay period that doesn&apos;t apply</li>
          </ul>
        </div>
        <div className={styles.warningBulletSection}>
          <p className={styles.warningBulletHeading}>Do not use a reversal when:</p>
          <ul className={styles.warningBulletList}>
            <li>An employee was paid an incorrect amount — use an adjustment payroll instead</li>
            <li>You need to update tax withholding settings — edit the employee profile</li>
            <li>A direct deposit failed — contact support for ACH return procedures</li>
          </ul>
        </div>
      </div>

      <Components.Alert
        status="info"
        label="Consider alternatives before reversing"
      >
        <Components.Text size="sm">
          For overpayments, you can run a corrective payroll in the next pay period. For minor
          errors, an off-cycle adjustment is less disruptive. Reach out to Gusto support if
          you&apos;re unsure which option fits your situation.
        </Components.Text>
      </Components.Alert>

      <div className={styles.actionRow}>
        <Components.Button variant="primary" onClick={onContinue}>
          Continue to payroll selection
        </Components.Button>
        <Components.Button variant="secondary" onClick={onCancel}>
          Cancel
        </Components.Button>
      </div>
    </Flex>
  )
}
