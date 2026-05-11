import classNames from 'classnames'
import type { LoadingSpinnerProps } from '@gusto/embedded-react-sdk'
import styles from './LoadingSpinner.module.scss'

export function LoadingSpinner({
  size = 'lg',
  style = 'block',
  className,
  id,
  'aria-label': ariaLabel = 'Loading',
}: LoadingSpinnerProps) {
  return (
    <div
      id={id}
      role="status"
      aria-label={ariaLabel}
      data-size={size}
      data-style={style}
      className={classNames(styles.root, className)}
    >
      <span className={styles.spinner} aria-hidden="true" />
    </div>
  )
}
