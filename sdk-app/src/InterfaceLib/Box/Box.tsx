import classNames from 'classnames'
import type { BoxProps } from '@gusto/embedded-react-sdk'
import styles from './Box.module.scss'

export function Box({ children, header, footer, withPadding = true, className }: BoxProps) {
  return (
    <div className={classNames(styles.root, className)}>
      {header && <div className={styles.header}>{header}</div>}
      <div className={withPadding ? styles.content : styles.contentFlush}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  )
}
