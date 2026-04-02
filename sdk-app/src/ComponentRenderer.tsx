import { Suspense, useState, useCallback, useRef, Component, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { findComponent, CATEGORIES } from './registry'
import type { EntityIds } from './useEntities'
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
          <div className="content-body">
            <div className="warning-card">
              <strong>Missing required props</strong>
              <p>
                This component requires additional props that aren&apos;t set. These may need to be
                provided manually via the Settings panel or are only available in specific contexts.
              </p>
              <div className="warning-card__tags">
                {validationIssues.map((issue, i) => (
                  <span key={i} className="warning-card__tag">
                    {issue.path}
                  </span>
                ))}
              </div>
              <div className="warning-card__actions">
                <button onClick={this.handleReset} type="button" className="settings-btn">
                  Try again
                </button>
              </div>
            </div>
          </div>
        )
      }

      return (
        <div className="content-error">
          <div className="content-error-message">
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
      <div className="content-body">
        <p className="content-hint">Select a component from the sidebar.</p>
      </div>
    )
  }

  const matchedCategory = CATEGORIES.find(c => c.toLowerCase() === category.toLowerCase())
  const entry = matchedCategory ? findComponent(matchedCategory, componentName) : undefined

  if (!entry) {
    return (
      <div className="content-body">
        <div className="content-error">
          <div className="content-error-message">
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
      <div className="content-header">
        {displayCategory} &rsaquo; <span>{entry.name}</span>
      </div>
      {missingIds.length > 0 || missingAdditionalProps.length > 0 ? (
        <div className="content-body">
          <div className="warning-card">
            <strong>
              {missingIds.length > 0 ? 'Missing required IDs' : 'Missing required props'}
            </strong>
            {missingIds.length > 0 && (
              <>
                <div className="warning-card__tags">
                  {missingIds.map(id => (
                    <span key={id} className="warning-card__tag">
                      {id}
                    </span>
                  ))}
                </div>
                <div className="warning-card__description">
                  Set these IDs in <strong>Settings</strong> (top right) or run{' '}
                  <code>npm run sdk-app:setup --env=demo</code>
                </div>
              </>
            )}
            {missingAdditionalProps.length > 0 && (
              <div className="warning-card__description">
                <div>
                  This component requires props that are not auto-provisioned. It typically needs
                  context from a parent flow (e.g. a form ID selected in a previous step).
                </div>
                <div className="warning-card__tags">
                  {missingAdditionalProps.map(prop => (
                    <span key={prop} className="warning-card__tag warning-card__tag--alt">
                      {prop}
                    </span>
                  ))}
                </div>
                <div className="warning-card__hint">
                  Try the parent flow component instead, or pass these props manually if testing.
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="content-body">
          <ComponentErrorBoundary
            onReset={() => {
              resetKeyRef.current++
            }}
          >
            <GustoProvider config={{ baseUrl: `${window.location.origin}/api/` }} key={providerKey}>
              <Suspense fallback={<div className="content-loading">Loading...</div>}>
                <SdkComponent {...componentProps} />
              </Suspense>
            </GustoProvider>
          </ComponentErrorBoundary>
        </div>
      )}
      <div className="events-log">
        <div
          className="events-log-header"
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
            <div className="events-log-entries">
              {events.map((entry, i) => (
                <div key={i} className="events-log-entry">
                  <span className="events-log-timestamp">[{entry.timestamp}]</span>{' '}
                  {typeof entry.event === 'object'
                    ? JSON.stringify(entry.event, null, 2)
                    : JSON.stringify(entry.event)}
                </div>
              ))}
            </div>
          ) : (
            <div className="events-log-empty">
              No events yet. Interact with the component above.
            </div>
          ))}
      </div>
    </>
  )
}
