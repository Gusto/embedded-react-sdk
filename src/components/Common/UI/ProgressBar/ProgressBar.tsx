import classnames from 'classnames'
import { VisuallyHidden } from '../../VisuallyHidden'
import { Flex } from '../../Flex'
import type { ProgressBarProps } from './ProgressBarTypes'
import styles from './ProgressBar.module.scss'

/**
 * Renders a horizontal progress indicator showing the current step within a multi-step sequence.
 *
 * @param props - The {@link ProgressBarProps} controlling the step count, label, and optional CTA.
 * @returns The rendered progress bar with an accessible progress element.
 * @internal
 */
export function ProgressBar({
  className,
  totalSteps,
  currentStep,
  label,
  cta: Cta,
}: ProgressBarProps) {
  const clampedStep = Math.max(1, Math.min(currentStep, totalSteps))
  const progressBarStyle = {
    '--g-progress-bar-width': `${(clampedStep * 100) / totalSteps}%`,
  } as React.CSSProperties
  return (
    <Flex flexDirection="column">
      {Cta && <Cta />}
      <div className={classnames(styles.root, className)} style={progressBarStyle}>
        <VisuallyHidden>
          <progress aria-label={label} value={clampedStep} max={totalSteps}></progress>
        </VisuallyHidden>
      </div>
    </Flex>
  )
}
