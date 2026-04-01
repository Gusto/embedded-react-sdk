import cn from 'classnames'
import styles from './Box.module.scss'
import type { BoxProps } from '@/components/Common/UI/Box/BoxTypes'

export function Box({ children, header, footer, contentVariant = 'default', className }: BoxProps) {
  return (
    <div className={cn(styles.root, className)} data-testid="data-box">
      {header && <div className={styles.header}>{header}</div>}
      <div className={contentVariant === 'flush' ? styles.contentFlush : styles.content}>
        {children}
      </div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  )
}
