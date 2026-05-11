import type { PayrollLoadingProps } from '@gusto/embedded-react-sdk'
import styles from './PayrollLoading.module.scss'

export function PayrollLoading({ title, description }: PayrollLoadingProps) {
  return (
    <div role="status" aria-live="polite" className={styles.root}>
      <span className={styles.spinner} aria-hidden="true" />
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        {description && <p className={styles.description}>{description}</p>}
      </div>
    </div>
  )
}
