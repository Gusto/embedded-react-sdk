/* eslint-disable react-refresh/only-export-components -- shared harness module intentionally colocates hooks, helpers, and small presentational components */
import { useCallback, useState, type ReactNode } from 'react'
import styles from './RropApiVerification.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/**
 * Lifecycle of a single verification step. `success` means the operation
 * resolved AND the generated SDK parsed the response through its zod schemas
 * without throwing — which is exactly what we're verifying.
 */
export type StepPhase = 'idle' | 'running' | 'success' | 'error'

export interface ZodIssue {
  path: string
  message: string
  code?: string
}

/**
 * A normalized view of whatever a hook threw. `zod` is the case that "tanks the
 * page": the request succeeded over the wire but the response shape didn't match
 * the generated types, so the SDK's response parser rejected it.
 */
export interface ClassifiedError {
  kind: 'zod' | 'api' | 'unknown'
  message: string
  issues?: ZodIssue[]
  rawValue?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * Turn an unknown thrown value into a {@link ClassifiedError}, pulling zod issue
 * paths out of the SDK's `SDKValidationError` (its `cause` is the underlying
 * `ZodError`). We match on `name`/duck-typing rather than `instanceof` so a
 * duplicated module copy of the error class can't cause a false negative.
 */
export function classifyError(error: unknown): ClassifiedError {
  if (!isRecord(error)) {
    return { kind: 'unknown', message: String(error) }
  }

  const name = typeof error.name === 'string' ? error.name : ''
  const rawMessage = typeof error.rawMessage === 'string' ? error.rawMessage : undefined
  const message =
    (typeof error.message === 'string' && error.message) || rawMessage || 'Unknown error'

  const cause = error.cause
  const zodIssues =
    isRecord(cause) && Array.isArray(cause.issues)
      ? (cause.issues as Array<Record<string, unknown>>)
      : undefined

  const looksLikeValidation =
    name === 'SDKValidationError' ||
    name === 'ResponseValidationError' ||
    ('rawValue' in error && 'pretty' in error) ||
    (!!zodIssues && zodIssues.length > 0)

  if (looksLikeValidation && zodIssues) {
    return {
      kind: 'zod',
      message: rawMessage ?? message,
      issues: zodIssues.map(issue => ({
        path:
          Array.isArray(issue.path) && issue.path.length > 0
            ? (issue.path as unknown[]).join('.')
            : '<root>',
        message: typeof issue.message === 'string' ? issue.message : 'Invalid',
        code: typeof issue.code === 'string' ? issue.code : undefined,
      })),
      rawValue: 'rawValue' in error ? error.rawValue : undefined,
    }
  }

  if (looksLikeValidation) {
    return { kind: 'zod', message, rawValue: 'rawValue' in error ? error.rawValue : undefined }
  }

  return { kind: 'api', message }
}

/**
 * Drives a single imperative (mutation-style) verification step: tracks phase +
 * classified error, and reports `success` only when the async op resolves — i.e.
 * the SDK parsed the response without a zod throw.
 */
export function useAsyncStep<T>() {
  const [phase, setPhase] = useState<StepPhase>('idle')
  const [error, setError] = useState<ClassifiedError | null>(null)
  const [result, setResult] = useState<T | null>(null)

  const run = useCallback(async (fn: () => Promise<T>): Promise<T | undefined> => {
    setPhase('running')
    setError(null)
    try {
      const value = await fn()
      setResult(value)
      setPhase('success')
      return value
    } catch (thrown) {
      setError(classifyError(thrown))
      setPhase('error')
      return undefined
    }
  }, [])

  return { phase, error, result, run }
}

const PHASE_LABEL: Record<StepPhase, string> = {
  idle: 'Not run',
  running: 'Running…',
  success: 'Parsed OK',
  error: 'Failed',
}

export function StatusPill({ phase }: { phase: StepPhase }) {
  return <span className={`${styles.pill} ${styles[`pill_${phase}`]}`}>{PHASE_LABEL[phase]}</span>
}

/** Pretty-printed, collapsible JSON. Serializes SDK `RFCDate`/`Date` values as strings. */
export function JsonBlock({ label, value }: { label: string; value: unknown }) {
  const [open, setOpen] = useState(false)
  let text: string
  try {
    text = JSON.stringify(value, jsonReplacer, 2)
  } catch {
    text = String(value)
  }
  return (
    <div className={styles.jsonBlock}>
      <button
        type="button"
        className={styles.jsonToggle}
        onClick={() => {
          setOpen(o => !o)
        }}
      >
        {open ? '▾' : '▸'} {label}
      </button>
      {open && <pre className={styles.jsonPre}>{text}</pre>}
    </div>
  )
}

function jsonReplacer(_key: string, value: unknown): unknown {
  if (value instanceof Date) return value.toISOString()
  if (isRecord(value) && typeof (value as { toString?: unknown }).toString === 'function') {
    // SDK RFCDate stringifies to YYYY-MM-DD; leave plain objects alone.
    const ctorName = (value as { constructor?: { name?: string } }).constructor?.name
    if (ctorName === 'RFCDate') return (value as { toString: () => string }).toString()
  }
  return value
}

export function ZodErrorPanel({ error }: { error: ClassifiedError }) {
  return (
    <div className={styles.zodPanel}>
      <div className={styles.zodPanelTitle}>Response failed zod validation (type mismatch)</div>
      <div className={styles.zodPanelMessage}>{error.message}</div>
      {error.issues && error.issues.length > 0 && (
        <ul className={styles.zodIssueList}>
          {error.issues.map((issue, i) => (
            <li key={i}>
              <code>{issue.path}</code>: {issue.message}
              {issue.code ? ` (${issue.code})` : ''}
            </li>
          ))}
        </ul>
      )}
      {error.rawValue !== undefined && (
        <JsonBlock label="Raw value that failed" value={error.rawValue} />
      )}
    </div>
  )
}

export function ApiErrorPanel({ error }: { error: ClassifiedError }) {
  return (
    <div className={styles.apiPanel}>
      <div className={styles.apiPanelTitle}>Request error (not a type mismatch)</div>
      <div className={styles.apiPanelMessage}>{error.message}</div>
    </div>
  )
}

interface StepCardProps {
  title: string
  description?: ReactNode
  phase: StepPhase
  error?: ClassifiedError | null
  actions?: ReactNode
  children?: ReactNode
}

/** One verification step: title, run button(s), status, and result/error body. */
export function StepCard({ title, description, phase, error, actions, children }: StepCardProps) {
  return (
    <div className={styles.stepCard}>
      <div className={styles.stepHeader}>
        <div className={styles.stepHeaderText}>
          <div className={styles.stepTitle}>
            {title} <StatusPill phase={phase} />
          </div>
          {description && <div className={styles.stepDescription}>{description}</div>}
        </div>
        {actions && <div className={styles.stepActions}>{actions}</div>}
      </div>
      {error && error.kind === 'zod' && <ZodErrorPanel error={error} />}
      {error && error.kind !== 'zod' && <ApiErrorPanel error={error} />}
      {children && <div className={styles.stepBody}>{children}</div>}
    </div>
  )
}

/** A labeled key/value pair for surfacing the specific RRoP fields under test. */
export function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldValue}>{value ?? <em>—</em>}</span>
    </div>
  )
}

/** Small run button that mirrors the SDK Button but stays enabled-aware. */
export function RunButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  const Components = useComponentContext()
  return (
    <Components.Button variant="secondary" onClick={onClick} isDisabled={disabled}>
      {children}
    </Components.Button>
  )
}
