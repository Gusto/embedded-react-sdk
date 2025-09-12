import type React from 'react'
import classnames from 'classnames'
import styles from './Badge.module.scss'
import type { BadgeProps } from './BadgeTypes'
import { BadgeDefaults } from './BadgeTypes'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'

export const Badge: React.FC<BadgeProps> = rawProps => {
  const resolvedProps = applyMissingDefaults(rawProps, BadgeDefaults)
  const { className, children, status: variant, ...otherProps } = resolvedProps
  return (
    <span {...otherProps} className={classnames(styles.badge, className)} data-variant={variant}>
      {children}
    </span>
  )
}
