import type React from 'react'
import classnames from 'classnames'
import styles from './LoadingSpinner.module.scss'
import type { LoadingSpinnerProps } from './LoadingSpinnerTypes'
import { LoadingSpinnerDefaults } from './LoadingSpinnerTypes'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'
import SpinnerIcon from '@/assets/icons/spinner_large.svg?react'

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = rawProps => {
  const resolvedProps = applyMissingDefaults(rawProps, LoadingSpinnerDefaults)
  const { className, size, style, ...otherProps } = resolvedProps

  return (
    <div
      {...otherProps}
      className={classnames(styles.loadingSpinner, className)}
      data-size={size}
      data-style={style}
      role="status"
      aria-label={otherProps['aria-label'] || 'Loading'}
    >
      <SpinnerIcon className={styles.spinnerIcon} aria-hidden="true" />
    </div>
  )
}
