import classNames from 'classnames'
import type { BadgeProps } from '@gusto/embedded-react-sdk'
import styles from './Badge.module.scss'

export function Badge({
  status = 'info',
  children,
  onDismiss,
  dismissAriaLabel = 'Dismiss',
  isDisabled = false,
  className,
  id,
  'aria-label': ariaLabel,
}: BadgeProps) {
  return (
    <span
      id={id}
      aria-label={ariaLabel}
      data-status={status}
      data-disabled={isDisabled || undefined}
      className={classNames(styles.root, className)}
    >
      <span className={styles.label}>{children}</span>
      {onDismiss && (
        <button
          type="button"
          aria-label={dismissAriaLabel}
          disabled={isDisabled}
          onClick={onDismiss}
          className={styles.dismiss}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <path
              d="M1 1l8 8M9 1l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </span>
  )
}
