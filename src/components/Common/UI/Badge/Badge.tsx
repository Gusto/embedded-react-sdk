import type React from 'react'
import classnames from 'classnames'
import styles from './Badge.module.scss'
import type { BadgeProps } from './BadgeTypes'
import { BadgeDefaults } from './BadgeTypes'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'
import CloseIcon from '@/assets/icons/close.svg?react'

/**
 * Renders a compact status indicator with optional dismiss control, used to label rows, tags, or summary chips.
 *
 * @param rawProps - The {@link BadgeProps} controlling the badge content, status variant, and dismiss behavior.
 * @returns The rendered badge.
 * @internal
 */
export const Badge: React.FC<BadgeProps> = rawProps => {
  const resolvedProps = applyMissingDefaults(rawProps, BadgeDefaults)
  const {
    className,
    children,
    status: variant,
    onDismiss,
    dismissAriaLabel = 'Dismiss',
    isDisabled,
    ...otherProps
  } = resolvedProps
  return (
    <span
      {...otherProps}
      className={classnames(styles.badge, onDismiss && styles.dismissable, className)}
      data-variant={variant}
      aria-disabled={isDisabled || undefined}
    >
      {children}
      {onDismiss && (
        <button
          type="button"
          className={styles.dismissButton}
          onClick={onDismiss}
          disabled={isDisabled}
          aria-label={dismissAriaLabel}
        >
          <CloseIcon aria-hidden width={12} height={12} />
        </button>
      )}
    </span>
  )
}
