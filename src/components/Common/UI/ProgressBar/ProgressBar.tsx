import classnames from 'classnames'
import type { ProgressBarProps } from './ProgressBarTypes'
import styles from './ProgressBar.module.scss'

export function ProgressBar({ className, totalSteps, currentStep, label }: ProgressBarProps) {
  const clampedStep = Math.max(1, Math.min(currentStep, totalSteps));
  const progressBarStyle = {
    '--g-progress-bar-width': `${(clampedStep * 100) / totalSteps}%`,
  } as React.CSSProperties
  return (
    <div className={classnames(styles.root, className)} style={progressBarStyle}>
      <progress aria-label="progress bar" value={clampedStep} max={totalSteps}></progress>
    </div>
  )
}
