import cn from 'classnames'
import styles from './Box.module.scss'
import { type BoxProps } from '@/components/Common/UI/Box/BoxTypes'

export function Box({ children, header, footer, className }: BoxProps) {
  return (
    <div className={cn(styles.boxContainer, className)} data-testid="data-box">
      {header && <div className={styles.boxHeader}>{header}</div>}
      <div className={styles.boxBody}>{children}</div>
      {footer && <div className={styles.boxFooter}>{footer}</div>}
    </div>
  )
}
