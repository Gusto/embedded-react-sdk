import classNames from 'classnames'
import type { BannerProps } from '@gusto/embedded-react-sdk'
import styles from './Banner.module.scss'

export function Banner({
  title,
  children,
  status = 'warning',
  className,
  id,
  'aria-label': ariaLabel,
}: BannerProps) {
  return (
    <div
      id={id}
      role="region"
      aria-label={ariaLabel}
      data-status={status}
      className={classNames(styles.root, className)}
    >
      <div className={styles.header}>{title}</div>
      <div className={styles.body}>{children}</div>
    </div>
  )
}
