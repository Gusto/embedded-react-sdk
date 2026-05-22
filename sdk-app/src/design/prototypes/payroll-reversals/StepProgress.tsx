import styles from './PayrollReversalsFlow.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface StepProgressProps {
  current: number
  total: number
  label: string
}

export function StepProgress({ current, total, label }: StepProgressProps) {
  const Components = useComponentContext()

  return (
    <div className={styles.stepProgress}>
      <div className={styles.stepProgressHeader}>
        <span className={styles.stepProgressLabel}>{label}</span>
        <span className={styles.stepProgressLabel}>
          Step {current} of {total}
        </span>
      </div>
      <Components.ProgressBar
        currentStep={current}
        totalSteps={total}
        label={`Step ${current} of ${total}: ${label}`}
      />
    </div>
  )
}
