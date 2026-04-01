import cn from 'classnames'
import styles from './Box.module.scss'
import type { BoxProps } from '@/components/Common/UI/Box/BoxTypes'

export function Box({ children, header, footer, withPadding = true, className }: BoxProps) {
  return (
    <div className={cn(styles.root, className)} data-testid="data-box">
      {header && <div className={styles.header}>{header}</div>}
      <div className={withPadding ? styles.content : styles.contentFlush}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  )
}
