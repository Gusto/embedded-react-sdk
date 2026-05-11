import type { BoxHeaderProps } from '@gusto/embedded-react-sdk'
import styles from './BoxHeader.module.scss'

export function BoxHeader({ title, description, action, headingLevel = 'h3' }: BoxHeaderProps) {
  const Heading = headingLevel
  return (
    <div className={styles.root}>
      <div className={styles.titleBlock}>
        <Heading className={styles.title}>{title}</Heading>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
