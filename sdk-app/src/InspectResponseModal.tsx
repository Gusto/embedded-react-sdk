import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CopyTextButton } from './CopyTextButton'
import type { InspectRequest } from './entity-config'
import panelStyles from './DemoSettingsPanel.module.scss'
import styles from './InspectResponseModal.module.scss'

type InspectFetchState =
  | { kind: 'loading' }
  | { kind: 'ok'; body: unknown }
  | { kind: 'error'; status: number; body: string }

type FilterResult = { matched: true; value: unknown } | { matched: false }

function filterJsonByKey(value: unknown, query: string): FilterResult {
  const q = query.trim().toLowerCase()
  if (!q) return { matched: true, value }
  if (Array.isArray(value)) {
    const items: unknown[] = []
    for (const item of value) {
      const res = filterJsonByKey(item, query)
      if (res.matched) items.push(res.value)
    }
    return items.length ? { matched: true, value: items } : { matched: false }
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    let any = false
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k.toLowerCase().includes(q)) {
        out[k] = v
        any = true
      }
    }
    return any ? { matched: true, value: out } : { matched: false }
  }
  return { matched: false }
}

function highlightJsonTokens(source: string): ReactNode[] {
  const tokenRegex =
    /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let keyCounter = 0
  let match: RegExpExecArray | null
  while ((match = tokenRegex.exec(source))) {
    if (match.index > lastIndex) {
      nodes.push(source.slice(lastIndex, match.index))
    }
    const [whole, str, colon, literal, num] = match
    if (str !== undefined) {
      const className = colon ? styles.jsonKey : styles.jsonString
      nodes.push(
        <span key={keyCounter++} className={className}>
          {str}
        </span>,
      )
      if (colon) nodes.push(colon)
    } else if (literal !== undefined) {
      nodes.push(
        <span
          key={keyCounter++}
          className={literal === 'null' ? styles.jsonNull : styles.jsonBoolean}
        >
          {literal}
        </span>,
      )
    } else if (num !== undefined) {
      nodes.push(
        <span key={keyCounter++} className={styles.jsonNumber}>
          {num}
        </span>,
      )
    } else {
      nodes.push(whole)
    }
    lastIndex = match.index + whole.length
  }
  if (lastIndex < source.length) nodes.push(source.slice(lastIndex))
  return nodes
}

interface InspectResponseModalProps {
  label: string
  request: InspectRequest
  onClose: () => void
}

export function InspectResponseModal({ label, request, onClose }: InspectResponseModalProps) {
  const [fetchState, setFetchState] = useState<InspectFetchState>({ kind: 'loading' })
  const [filter, setFilter] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, 10000)
    setFetchState({ kind: 'loading' })
    setFilter('')
    void (async () => {
      try {
        const res = await fetch(request.url, { signal: controller.signal })
        const text = await res.text()
        if (controller.signal.aborted) return
        if (!res.ok) {
          setFetchState({ kind: 'error', status: res.status, body: text })
          return
        }
        let parsed: unknown = text
        try {
          parsed = JSON.parse(text)
        } catch {
          // Non-JSON body — display as-is
        }
        if (request.kind === 'listFilter') {
          const list = Array.isArray(parsed) ? (parsed as Array<Record<string, unknown>>) : []
          const match = list.find(item => item.uuid === request.matchUuid)
          if (!match) {
            setFetchState({
              kind: 'error',
              status: 404,
              body: `No item with uuid ${request.matchUuid} in list of ${list.length} from ${request.url.replace(/^\/api/, '')}`,
            })
            return
          }
          setFetchState({ kind: 'ok', body: match })
          return
        }
        setFetchState({ kind: 'ok', body: parsed })
      } catch (err) {
        if (controller.signal.aborted) return
        setFetchState({
          kind: 'error',
          status: 0,
          body: err instanceof Error ? err.message : String(err),
        })
      }
    })()
    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [request])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  const filteredBody = useMemo<FilterResult | null>(
    () => (fetchState.kind === 'ok' ? filterJsonByKey(fetchState.body, filter) : null),
    [fetchState, filter],
  )

  const copyValue =
    fetchState.kind === 'ok' && filteredBody?.matched
      ? JSON.stringify(filteredBody.value, null, 2)
      : fetchState.kind === 'error'
        ? `HTTP ${fetchState.status}\n\n${fetchState.body}`
        : ''

  return createPortal(
    <div className={styles.backdrop}>
      <button
        type="button"
        className={styles.backdropDismiss}
        aria-label="Close inspect dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${label} response`}
        className={styles.modal}
      >
        <header className={styles.header}>
          <div>
            <h4 className={styles.title}>{label} response</h4>
            <div className={styles.url}>GET {request.url.replace(/^\/api/, '')}</div>
          </div>
          <div className={styles.headerActions}>
            <CopyTextButton value={copyValue} ariaLabel="Copy response" idleLabel="Copy" />
            <button
              type="button"
              className={panelStyles.btn}
              onClick={onClose}
              aria-label="Close inspect dialog"
            >
              Close
            </button>
          </div>
        </header>
        {fetchState.kind === 'ok' && (
          <div className={styles.filterBar}>
            <input
              type="search"
              value={filter}
              onChange={e => {
                setFilter(e.target.value)
              }}
              placeholder="Filter by key…"
              aria-label="Filter response by key"
            />
          </div>
        )}
        {fetchState.kind === 'loading' && <div className={styles.bodyMessage}>Loading…</div>}
        {fetchState.kind === 'ok' &&
          (filteredBody?.matched ? (
            <pre className={styles.body}>
              {highlightJsonTokens(JSON.stringify(filteredBody.value, null, 2))}
            </pre>
          ) : (
            <div className={styles.bodyMessage}>No keys matching “{filter}”.</div>
          ))}
        {fetchState.kind === 'error' && (
          <pre className={styles.body}>{`HTTP ${fetchState.status}\n\n${fetchState.body}`}</pre>
        )}
      </div>
    </div>,
    document.body,
  )
}

interface InspectIdButtonProps {
  label: string
  request: InspectRequest | null
}

export function InspectIdButton({ label, request }: InspectIdButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        className={panelStyles.btn}
        onClick={() => {
          if (request) setIsOpen(true)
        }}
        disabled={!request}
        aria-label={`Inspect ${label.toLowerCase()} response`}
        title={
          request
            ? `GET ${request.url.replace(/^\/api/, '')}${
                request.kind === 'listFilter' ? ` (filtered for ${request.matchUuid})` : ''
              }`
            : 'No GET endpoint available'
        }
      >
        🕵️
      </button>
      {isOpen && request && (
        <InspectResponseModal
          label={label}
          request={request}
          onClose={() => {
            setIsOpen(false)
          }}
        />
      )}
    </>
  )
}
