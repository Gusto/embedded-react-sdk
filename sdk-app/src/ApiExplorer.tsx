import { useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { EntityIds } from './useEntities'
import panelStyles from './DemoSettingsPanel.module.scss'
import styles from './ApiExplorer.module.scss'

const METHODS = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'] as const
type Method = (typeof METHODS)[number]

interface QueryParam {
  id: number
  key: string
  value: string
}

type RequestState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'done'; status: number; ok: boolean; durationMs: number; body: string }
  | { kind: 'error'; message: string }

function prettyPrint(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2)
  } catch {
    return text
  }
}

function buildRequestPath(path: string, queryParams: QueryParam[]): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const [base, existingQuery] = normalizedPath.split('?')
  const searchParams = new URLSearchParams(existingQuery)
  for (const { key, value } of queryParams) {
    if (key.trim()) searchParams.append(key.trim(), value)
  }
  const queryString = searchParams.toString()
  return queryString ? `${base}?${queryString}` : base
}

export function ApiExplorer() {
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  const [method, setMethod] = useState<Method>('GET')
  const [path, setPath] = useState(() =>
    entities.companyId ? `/v1/companies/${entities.companyId}/` : '/v1/',
  )
  const [bodyText, setBodyText] = useState('')
  const [queryParams, setQueryParams] = useState<QueryParam[]>([])
  const [requestState, setRequestState] = useState<RequestState>({ kind: 'idle' })
  const abortRef = useRef<AbortController | null>(null)
  const nextParamId = useRef(0)

  const hasBody = method !== 'GET' && method !== 'DELETE'

  const addQueryParam = () => {
    setQueryParams(prev => [...prev, { id: nextParamId.current++, key: '', value: '' }])
  }

  const updateQueryParam = (id: number, field: 'key' | 'value', newValue: string) => {
    setQueryParams(prev => prev.map(p => (p.id === id ? { ...p, [field]: newValue } : p)))
  }

  const removeQueryParam = (id: number) => {
    setQueryParams(prev => prev.filter(p => p.id !== id))
  }

  const sendRequest = async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    let requestBody: string | undefined
    if (hasBody && bodyText.trim()) {
      try {
        requestBody = JSON.stringify(JSON.parse(bodyText))
      } catch {
        setRequestState({ kind: 'error', message: 'Request body is not valid JSON.' })
        return
      }
    }

    setRequestState({ kind: 'loading' })
    const requestPath = buildRequestPath(path, queryParams)
    const startedAt = performance.now()
    try {
      const res = await fetch(`/api${requestPath}`, {
        method,
        headers: requestBody ? { 'Content-Type': 'application/json' } : undefined,
        body: requestBody,
        signal: controller.signal,
      })
      const text = await res.text()
      if (controller.signal.aborted) return
      setRequestState({
        kind: 'done',
        status: res.status,
        ok: res.ok,
        durationMs: Math.round(performance.now() - startedAt),
        body: text,
      })
    } catch (err) {
      if (controller.signal.aborted) return
      setRequestState({ kind: 'error', message: err instanceof Error ? err.message : String(err) })
    }
  }

  return (
    <div className={styles.root}>
      <h1>API Explorer</h1>
      <p className={styles.hint}>
        Sends raw requests through the dev proxy at <code>/api</code>, bypassing the generated SDK —
        so unpublished/undocumented endpoints work here too. The proxy injects the partner auth
        token; no token is visible here.
      </p>

      <div className={styles.requestRow}>
        <select
          className={styles.methodSelect}
          value={method}
          onChange={e => {
            setMethod(e.target.value as Method)
          }}
          aria-label="HTTP method"
        >
          {METHODS.map(m => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          className={styles.pathInput}
          value={path}
          onChange={e => {
            setPath(e.target.value)
          }}
          placeholder="/v1/companies/.../time_sheets"
          aria-label="Request path"
          spellCheck={false}
        />
        <button
          type="button"
          className={panelStyles.btn}
          onClick={() => {
            void sendRequest()
          }}
          disabled={requestState.kind === 'loading' || !path.trim()}
        >
          {requestState.kind === 'loading' ? 'Sending…' : 'Send'}
        </button>
      </div>

      <div className={styles.queryParams}>
        <div className={styles.queryParamsHeader}>
          <span>Query params</span>
          <button type="button" className={panelStyles.btn} onClick={addQueryParam}>
            + Add param
          </button>
        </div>
        {queryParams.map(param => (
          <div key={param.id} className={styles.queryParamRow}>
            <input
              className={styles.queryParamInput}
              value={param.key}
              onChange={e => {
                updateQueryParam(param.id, 'key', e.target.value)
              }}
              placeholder="key"
              aria-label="Query param key"
              spellCheck={false}
            />
            <input
              className={styles.queryParamInput}
              value={param.value}
              onChange={e => {
                updateQueryParam(param.id, 'value', e.target.value)
              }}
              placeholder="value"
              aria-label="Query param value"
              spellCheck={false}
            />
            <button
              type="button"
              className={panelStyles.btn}
              onClick={() => {
                removeQueryParam(param.id)
              }}
              aria-label="Remove query param"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {hasBody && (
        <textarea
          className={styles.bodyInput}
          value={bodyText}
          onChange={e => {
            setBodyText(e.target.value)
          }}
          placeholder="Request body (JSON)"
          aria-label="Request body"
          rows={8}
          spellCheck={false}
        />
      )}

      <div className={styles.responsePane}>
        {requestState.kind === 'idle' && (
          <div className={styles.placeholder}>No request sent yet.</div>
        )}
        {requestState.kind === 'loading' && <div className={styles.placeholder}>Loading…</div>}
        {requestState.kind === 'error' && (
          <div className={styles.error}>{requestState.message}</div>
        )}
        {requestState.kind === 'done' && (
          <>
            <div
              className={`${styles.statusLine} ${requestState.ok ? styles.statusOk : styles.statusError}`}
            >
              HTTP {requestState.status} · {requestState.durationMs}ms
            </div>
            <pre className={styles.body}>{prettyPrint(requestState.body)}</pre>
          </>
        )}
      </div>
    </div>
  )
}
