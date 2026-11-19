import { useContext, type ReactNode } from 'react'
import { GapContext } from './gapContext'
import { GAP_NUMBER } from './gaps'
import styles from './TimeTrackingReview.module.scss'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function GapPin({ id }: { id: string }) {
  const { on, active, setActive } = useContext(GapContext)
  if (!on) return null
  return (
    <button
      type="button"
      className={`${styles.pin} ${active === id ? styles.pinActive : ''}`}
      onClick={event => {
        event.stopPropagation()
        setActive(id)
      }}
      aria-label={`Gap ${GAP_NUMBER[id]}`}
    >
      {GAP_NUMBER[id]}
    </button>
  )
}

export function PrototypeModal({
  title,
  onClose,
  children,
  footer,
}: {
  title: ReactNode
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  const Components = useComponentContext()
  return (
    <Components.Modal
      isOpen
      onClose={onClose}
      shouldCloseOnBackdropClick
      footer={
        footer ?? (
          <Components.Button variant="secondary" onClick={onClose}>
            Close
          </Components.Button>
        )
      }
    >
      <Flex flexDirection="column" gap={16}>
        <Components.Heading as="h2" styledAs="h3">
          {title}
        </Components.Heading>
        {children}
      </Flex>
    </Components.Modal>
  )
}

export function RequestBlock({
  method,
  path,
  body,
  caption,
}: {
  method: string
  path: string
  body?: unknown
  caption?: ReactNode
}) {
  return (
    <div className={styles.request}>
      <div className={styles.requestLine}>
        <span className={styles.method}>{method}</span>
        <code>{path}</code>
      </div>
      {caption && <div className={styles.requestCaption}>{caption}</div>}
      {body !== undefined && (
        <pre className={styles.requestBody}>{JSON.stringify(body, null, 2)}</pre>
      )}
    </div>
  )
}

export function ReadOnlyNote() {
  return (
    <p className={styles.readOnly}>
      Not sent. This prototype only reads from the shared demo company.
    </p>
  )
}
