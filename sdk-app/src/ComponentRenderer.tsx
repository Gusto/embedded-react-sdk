import { Suspense, useState, useCallback, useRef, Component, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { findComponent, CATEGORIES } from './registry'
import type { EntityIds } from './useEntities'
import styles from './ComponentRenderer.module.scss'
import { GustoProvider } from '@/contexts'
import '@/styles/sdk.scss'

interface ComponentRendererProps {
  entities: EntityIds
}

interface EventLogEntry {
  timestamp: string
  event: unknown
}

interface ErrorBoundaryProps {
  children: ReactNode
  onReset: () => void
}

interface ErrorBoundaryState {
  error: Error | null
}

interface ValidationIssue {
  path: string
  message: string
}

function parseValidationError(error: Error): ValidationIssue[] | null {
  const cause = (error as { cause?: { issues?: { path?: string[]; message?: string }[] } }).cause
  if (cause?.issues && Array.isArray(cause.issues)) {
    return cause.issues.map(issue => ({
      path: issue.path?.join('.') || 'unknown',
      message: issue.message || 'Required',
    }))
  }

  const message = error.message
  if (!message.includes('validation failed') && !message.includes('invalid_type')) return null

  try {
    const match = message.match(/\[[\s\S]*\]/)
    if (match) {
      const issues = JSON.parse(match[0])
      if (Array.isArray(issues)) {
        return issues.map((issue: { path?: string[]; message?: string }) => ({
          path: issue.path?.join('.') || 'unknown',
          message: issue.message || 'Required',
        }))
      }
    }
  } catch {
    // Not parseable, fall through
  }
  return null
}

class ComponentErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  handleReset = () => {
    this.setState({ error: null })
    this.props.onReset()
  }

  render() {
    if (this.state.error) {
      const validationIssues = parseValidationError(this.state.error)

      if (validationIssues) {
        return (
          <div className={styles.contentBody}>
            <div className={styles.warningCard}>
              <strong>Missing required props</strong>
              <p>
                This component requires additional props that aren&apos;t set. These may need to be
                provided manually via the Settings panel or are only available in specific contexts.
              </p>
              <div className={styles.warningTags}>
                {validationIssues.map((issue, i) => (
                  <span key={i} className={styles.warningTag}>
                    {issue.path}
                  </span>
                ))}
              </div>
              <div className={styles.warningActions}>
                <button onClick={this.handleReset} type="button" className={styles.retryBtn}>
                  Try again
                </button>
              </div>
            </div>
          </div>
        )
      }

      return (
        <div className={styles.contentError}>
          <div className={styles.contentErrorMessage}>
            <strong>Error</strong>
            <pre>{this.state.error.message}</pre>
          </div>
          <button onClick={this.handleReset} type="button">
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export function ComponentRenderer({ entities }: ComponentRendererProps) {
  const { category, component: componentName } = useParams<{
    category: string
    component: string
  }>()
  const [events, setEvents] = useState<EventLogEntry[]>([])
  const [eventsOpen, setEventsOpen] = useState(true)
  const resetKeyRef = useRef(0)

  const handleEvent = useCallback((...args: unknown[]) => {
    const entry: EventLogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      event: args.length === 1 ? args[0] : args,
    }
    setEvents(prev => [entry, ...prev].slice(0, 100))
  }, [])

  if (!category || !componentName) {
    return (
      <div className={styles.contentBody}>
        <p className={styles.contentHint}>Select a component from the sidebar.</p>
      </div>
    )
  }

  const matchedCategory = CATEGORIES.find(c => c.toLowerCase() === category.toLowerCase())
  const entry = matchedCategory ? findComponent(matchedCategory, componentName) : undefined

  if (!entry) {
    return (
      <div className={styles.contentBody}>
        <div className={styles.contentError}>
          <div className={styles.contentErrorMessage}>
            Component not found: {category}/{componentName}
          </div>
        </div>
      </div>
    )
  }

  const SdkComponent = entry.component
  const displayCategory =
    entry.category === 'InformationRequests' ? 'Info Requests' : entry.category

  const componentProps: Record<string, unknown> = {
    onEvent: handleEvent,
  }

  const missingIds: string[] = []
  for (const requiredId of entry.requiredEntityIds) {
    const entityValue = entities[requiredId as keyof EntityIds]
    if (entityValue) {
      componentProps[requiredId] = entityValue
    } else {
      missingIds.push(requiredId)
    }
  }

  const missingAdditionalProps = entry.additionalRequiredProps.filter(
    prop =>
      !(prop in componentProps) ||
      componentProps[prop] === undefined ||
      componentProps[prop] === '',
  )

  const providerKey = `${category}/${componentName}/${entry.requiredEntityIds.map(id => entities[id as keyof EntityIds] || '').join('/')}/${resetKeyRef.current}`

  return (
    <>
      <div className={styles.contentHeader}>
        {displayCategory} &rsaquo; <span>{entry.name}</span>
      </div>
      {missingIds.length > 0 || missingAdditionalProps.length > 0 ? (
        <div className={styles.contentBody}>
          <div className={styles.warningCard}>
            <strong>
              {missingIds.length > 0 ? 'Missing required IDs' : 'Missing required props'}
            </strong>
            {missingIds.length > 0 && (
              <>
                <div className={styles.warningTags}>
                  {missingIds.map(id => (
                    <span key={id} className={styles.warningTag}>
                      {id}
                    </span>
                  ))}
                </div>
                <div className={styles.warningDescription}>
                  Set these IDs in <strong>Settings</strong> (top right) or run{' '}
                  <code>npm run sdk-app:setup --env=demo</code>
                </div>
              </>
            )}
            {missingAdditionalProps.length > 0 && (
              <div className={styles.warningDescription}>
                <div>
                  This component requires props that are not auto-provisioned. It typically needs
                  context from a parent flow (e.g. a form ID selected in a previous step).
                </div>
                <div className={styles.warningTags}>
                  {missingAdditionalProps.map(prop => (
                    <span key={prop} className={`${styles.warningTag} ${styles.warningTagAlt}`}>
                      {prop}
                    </span>
                  ))}
                </div>
                <div className={styles.warningHint}>
                  Try the parent flow component instead, or pass these props manually if testing.
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.contentBody}>
          <ComponentErrorBoundary
            onReset={() => {
              resetKeyRef.current++
            }}
          >
            <GustoProvider config={{ baseUrl: `${window.location.origin}/api/` }} key={providerKey}>
              <Suspense fallback={<div className={styles.contentLoading}>Loading...</div>}>
                <SdkComponent {...componentProps} />
              </Suspense>
            </GustoProvider>
          </ComponentErrorBoundary>
        </div>
      )}
      <div className={styles.eventsLog}>
        <div
          className={styles.eventsLogHeader}
          onClick={() => {
            setEventsOpen(!eventsOpen)
          }}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') setEventsOpen(!eventsOpen)
          }}
        >
          <span>Events Log ({events.length})</span>
          <span>{eventsOpen ? '▾' : '▸'}</span>
        </div>
        {eventsOpen &&
          (events.length > 0 ? (
            <div className={styles.eventsLogEntries}>
              {events.map((entry, i) => (
                <div key={i} className={styles.eventsLogEntry}>
                  <span className={styles.eventsLogTimestamp}>[{entry.timestamp}]</span>{' '}
                  {typeof entry.event === 'object'
                    ? JSON.stringify(entry.event, null, 2)
                    : JSON.stringify(entry.event)}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.eventsLogEmpty}>
              No events yet. Interact with the component above.
            </div>
          ))}
      </div>
    </>
  )
}
