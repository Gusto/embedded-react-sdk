import { useContext, type ReactNode } from 'react'
import { ChangeContext, GapContext } from './gapContext'
import { CHANGE_NUMBER, type ChangeId } from './changes'
import { GAP_NUMBER, type GapId } from './gaps'
import styles from './TimeTrackingReview.module.scss'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function GapPin({ id }: { id: GapId }) {
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

export function ChangePin({ id }: { id: ChangeId }) {
  const { on, active, setActive } = useContext(ChangeContext)
  if (!on) return null
  return (
    <button
      type="button"
      className={`${styles.pin} ${styles.changePin} ${active === id ? styles.changePinActive : ''}`}
      onClick={event => {
        event.stopPropagation()
        setActive(id)
      }}
      aria-label={`Change ${CHANGE_NUMBER[id]}`}
    >
      {CHANGE_NUMBER[id]}
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4.5 10.5L8.5 14.5L15.5 6"
        style={{ stroke: 'var(--row-icon-color)' }}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M14.5 5.5L5.5 14.5M5.5 5.5L14.5 14.5"
        style={{ stroke: 'var(--row-icon-color)' }}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true">
      <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function ApproveIcon() {
  return (
    <span className={styles.approveIcon}>
      <CheckIcon />
    </span>
  )
}

export function UnapproveIcon() {
  return (
    <span className={styles.unapproveIcon}>
      <XIcon />
    </span>
  )
}

export function ApprovalActions({
  label,
  approveCount,
  unapproveCount,
  onApprove,
  onUnapprove,
}: {
  label: string
  approveCount: number
  unapproveCount: number
  onApprove: () => void
  onUnapprove: () => void
}) {
  const Components = useComponentContext()
  return (
    <div className={styles.approveReject}>
      <Components.Button
        variant="tertiary"
        aria-label={`Approve ${label}`}
        isDisabled={approveCount === 0}
        onClick={onApprove}
        icon={<ApproveIcon />}
      >
        Approve ({approveCount})
      </Components.Button>
      <Components.Button
        variant="tertiary"
        aria-label={`Unapprove ${label}`}
        isDisabled={unapproveCount === 0}
        onClick={onUnapprove}
        icon={<UnapproveIcon />}
      >
        Unapprove ({unapproveCount})
      </Components.Button>
    </div>
  )
}

export interface Crumb {
  label: string
  onClick: () => void
}

export function Trail({ trail, current }: { trail: Crumb[]; current: string }) {
  const Components = useComponentContext()
  return (
    <Components.Breadcrumbs
      breadcrumbs={[
        ...trail.map((crumb, index) => ({ id: String(index), label: crumb.label })),
        {
          id: 'current',
          label: (
            <>
              {current} <ChangePin id="breadcrumbs" />
            </>
          ),
          isClickable: false,
        },
      ]}
      currentBreadcrumbId="current"
      onClick={id => {
        trail[Number(id)]?.onClick()
      }}
    />
  )
}

export function SubPage({
  trail,
  current,
  title,
  description,
  actions,
  footer,
  narrow,
  children,
}: {
  trail: Crumb[]
  current: string
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  footer?: ReactNode
  narrow?: boolean
  children: ReactNode
}) {
  const Components = useComponentContext()
  const width = narrow ? `${styles.subPageBody} ${styles.formPage}` : styles.subPageBody
  return (
    <Flex flexDirection="column" gap={20}>
      <Trail trail={trail} current={current} />
      <div className={styles.subPageHeader}>
        <div className={styles.subPageTitle}>
          <Components.Heading as="h2" styledAs="h3">
            {title}
          </Components.Heading>
          {description && <Components.Text variant="supporting">{description}</Components.Text>}
        </div>
        {actions && <div className={styles.subPageActions}>{actions}</div>}
      </div>
      <div className={width}>
        <Flex flexDirection="column" gap={16}>
          {children}
        </Flex>
      </div>
      {footer && <div className={width}>{footer}</div>}
    </Flex>
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
