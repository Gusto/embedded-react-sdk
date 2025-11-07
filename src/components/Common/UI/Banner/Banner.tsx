import type React from 'react'
import classnames from 'classnames'
import styles from './Banner.module.scss'
import type { BannerProps } from './BannerTypes'
import { BannerDefaults } from './BannerTypes'
import { applyMissingDefaults } from '@/helpers/applyMissingDefaults'
import InfoIcon from '@/assets/icons/info.svg?react'
import SuccessIcon from '@/assets/icons/success_check.svg?react'
import WarningIcon from '@/assets/icons/warning.svg?react'
import ErrorIcon from '@/assets/icons/error.svg?react'

export const Banner: React.FC<BannerProps> = rawProps => {
  const resolvedProps = applyMissingDefaults(rawProps, BannerDefaults)
  const { className, title, children, status, ...otherProps } = resolvedProps

  const IconComponent =
    status === 'info'
      ? InfoIcon
      : status === 'success'
        ? SuccessIcon
        : status === 'warning'
          ? WarningIcon
          : ErrorIcon

  return (
    <div
      {...otherProps}
      className={classnames(styles.banner, className)}
      data-status={status}
      role="status"
      aria-live="polite"
    >
      <div className={styles.header}>
        <div className={styles.icon}>
          <IconComponent aria-hidden />
        </div>
        <div className={styles.title}>{title}</div>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  )
}
