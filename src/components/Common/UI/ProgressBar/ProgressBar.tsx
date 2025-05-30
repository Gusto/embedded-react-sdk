import classnames from 'classnames'
import { VisuallyHidden } from '../../VisuallyHidden'
import type { ProgressBarProps } from './ProgressBarTypes'
import styles from './ProgressBar.module.scss'

export function ProgressBar({ className, totalSteps, currentStep, label }: ProgressBarProps) {
  const clampedStep = Math.max(1, Math.min(currentStep, totalSteps))
  const progressBarStyle = {
    '--g-progress-bar-width': `${(clampedStep * 100) / totalSteps}%`,
  } as React.CSSProperties
  return (
    <div className={classnames(styles.root, className)} style={progressBarStyle}>
      <VisuallyHidden>
        <progress aria-label={label} value={clampedStep} max={totalSteps}></progress>
      </VisuallyHidden>
    </div>
  )
}
