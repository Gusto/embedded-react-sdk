import styles from './Toast.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
//TODO: Style appropriately once design is available
/** @internal */
export function Toast({ message, onClose }: { message: string | null; onClose: () => void }) {
  const Components = useComponentContext()
  if (!message) return
  return (
    <div role="alert" className={styles.toast}>
      {message}
      <Components.Button onClick={onClose}>Close</Components.Button>
    </div>
  )
}
