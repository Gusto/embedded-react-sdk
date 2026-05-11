import classNames from 'classnames'
import type { ProgressBarProps } from '@gusto/embedded-react-sdk'
import styles from './ProgressBar.module.scss'

export function ProgressBar({
  totalSteps,
  currentStep,
  className,
  label,
  cta: Cta,
}: ProgressBarProps) {
  const safeTotal = Math.max(totalSteps, 1)
  const safeCurrent = Math.min(Math.max(currentStep, 0), safeTotal)
  const percent = (safeCurrent / safeTotal) * 100

  return (
    <div
      className={classNames(styles.root, className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeTotal}
      aria-valuenow={safeCurrent}
    >
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.steps}>
          {safeCurrent} / {safeTotal}
        </span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
      {Cta && (
        <div className={styles.cta}>
          <Cta />
        </div>
      )}
    </div>
  )
}
