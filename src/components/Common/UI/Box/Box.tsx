import cn from 'classnames'
import styles from './Box.module.scss'
import type { BoxProps } from '@/components/Common/UI/Box/BoxTypes'

/**
 * Renders a bordered container that groups related content, with optional header and footer slots.
 *
 * @param props - The {@link BoxProps} controlling the box contents, header, footer, and padding.
 * @returns The rendered box.
 * @internal
 */
export function Box({ children, header, footer, withPadding = true, className }: BoxProps) {
  return (
    <div className={cn(styles.root, className)} data-testid="data-box">
      {header && <div className={styles.header}>{header}</div>}
      <div className={withPadding ? styles.content : styles.contentFlush}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  )
}
