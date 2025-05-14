import classnames from 'classnames'
import type { ProgressBarProps } from './ProgressBarTypes'
import styles from './ProgressBar.module.scss'

export function ProgressBar({ className, totalSteps, currentStep, label }: ProgressBarProps) {
  if (currentStep > totalSteps) {
    currentStep = totalSteps
  }
  if (currentStep < 1) {
    currentStep = 1
  }
  const progressBarStyle = {
    '--g-progress-bar-width': `${(currentStep * 100) / totalSteps}%`,
  } as React.CSSProperties
  return (
    <div className={classnames(styles.root, className)} style={progressBarStyle}>
      <progress aria-label="progress bar" value={currentStep} max={totalSteps}></progress>
    </div>
  )
}
