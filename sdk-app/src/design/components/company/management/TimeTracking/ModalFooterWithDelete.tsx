import type { ReactNode } from 'react'
import styles from './ModalFooterWithDelete.module.scss'

interface ModalFooterWithDeleteProps {
  deleteAction: ReactNode
  children: ReactNode
}

/** Destructive action on the left, the remaining actions inline on the right. */
export function ModalFooterWithDelete({ deleteAction, children }: ModalFooterWithDeleteProps) {
  return (
    <div className={styles.footer}>
      {deleteAction}
      <div className={styles.actions}>{children}</div>
    </div>
  )
}
