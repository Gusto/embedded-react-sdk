import classNames from 'classnames'
import type { CardProps } from '@gusto/embedded-react-sdk'
import styles from './Card.module.scss'

export function Card({ children, menu, className, action }: CardProps) {
  return (
    <div className={classNames(styles.root, className)}>
      {action && <div className={styles.action}>{action}</div>}
      <div className={styles.body}>{children}</div>
      {menu && <div className={styles.menu}>{menu}</div>}
    </div>
  )
}
