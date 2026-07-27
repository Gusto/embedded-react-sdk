import cn from 'classnames'
import styles from './FormBox.module.scss'
import type { FormBoxProps } from '@/components/Common/UI/FormBox/FormBoxTypes'

/**
 * Renders a bordered container used to group related form fields, with an optional header slot.
 *
 * @param props - The {@link FormBoxProps} controlling the form box contents, header, and padding.
 * @returns The rendered form box.
 * @internal
 */
export function FormBox({ children, header, footer, withPadding = true, className }: FormBoxProps) {
  return (
    <div className={cn(styles.root, className)} data-testid="data-form-box">
      {header && <div className={styles.header}>{header}</div>}
      <div className={withPadding ? styles.content : styles.contentFlush}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  )
}
