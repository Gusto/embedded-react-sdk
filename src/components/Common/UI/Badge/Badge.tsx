import type React from 'react'
import classnames from 'classnames'
import styles from './Badge.module.scss'
import type { BadgeProps } from './BadgeTypes'

export const Badge: React.FC<BadgeProps> = ({
  className,
  children,
  status: variant = 'info',
  ...props
}) => {
  return (
    <span {...props} className={classnames(styles.badge, className)} data-variant={variant}>
      {children}
    </span>
  )
}
