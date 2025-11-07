import type React from 'react'
import classnames from 'classnames'
import styles from './Banner.module.scss'
import type { BannerProps } from './BannerTypes'
import { BannerDefaults } from './BannerTypes'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'
import InfoIcon from '@/assets/icons/icon-info-outline.svg?react'
import ErrorIcon from '@/assets/icons/icon-error-outline.svg?react'

export const Banner: React.FC<BannerProps> = rawProps => {
  const resolvedProps = applyMissingDefaults(rawProps, BannerDefaults)
  const { className, title, children, status, ...otherProps } = resolvedProps

  const IconComponent = status === 'error' ? ErrorIcon : InfoIcon
  return (
    <div
      {...otherProps}
      className={classnames(styles.banner, className)}
      data-status={status}
      role="status"
      aria-live="polite"
    >
      <div className={styles.header}>
        <IconComponent aria-hidden />
        <div className={styles.title}>{title}</div>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  )
}
