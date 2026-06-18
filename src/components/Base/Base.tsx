import type { ReactNode, JSX, ErrorInfo } from 'react'
import { Suspense, useEffect, useRef } from 'react'
import type { FallbackProps } from 'react-error-boundary'
import { ErrorBoundary } from 'react-error-boundary'
import { useTranslation } from 'react-i18next'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { FadeIn } from '../Common/FadeIn/FadeIn'
import { BaseContext, type OnEventType } from './useBase'
import { useBaseSubmit } from './useBaseSubmit'
import { componentEvents, type EventType } from '@/shared/constants'
import { InternalError } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import type { ResourceDictionary, Resources } from '@/types/Helpers'
import { useLoadingIndicator } from '@/contexts/LoadingIndicatorProvider/useLoadingIndicator'
import type { LoadingIndicatorContextProps } from '@/contexts/LoadingIndicatorProvider/useLoadingIndicator'
import { useObservability } from '@/contexts/ObservabilityProvider/useObservability'
import { normalizeToSDKError, type SDKError } from '@/types/sdkError'

/**
 * Props common to all SDK feature components, including children, an optional className, default form values, and an i18n resource dictionary override.
 *
 * @typeParam TResourceKey - The i18n resource namespace key whose dictionary entries can be overridden.
 * @public
 */
export interface CommonComponentInterface<TResourceKey extends keyof Resources = keyof Resources> {
  /** Optional child content rendered inside the component's layout. */
  children?: ReactNode
  /** CSS class name applied to the component's root element. */
  className?: string
  /**
   * Initial values pre-populated into the component's form fields before the user interacts.
   * The exact shape depends on the specific component — refer to each component's own props type.
   */
  defaultValues?: unknown
  /**
   * Overrides for the component's i18n strings. Supply a partial object whose keys match the
   * component's resource namespace — any omitted keys fall back to SDK defaults.
   * See the [Translation guide](https://docs.gusto.com/embedded-payroll/docs/translation) for details.
   */
  dictionary?: ResourceDictionary<TResourceKey>
}

/**
 * Props for SDK feature components that participate in the standard error/loading/observability surface.
 *
 * @remarks
 * Extends {@link CommonComponentInterface} with the `onEvent` callback that emits component events
 * and optional overrides for the error-boundary fallback and loading indicator. This is the prop
 * shape mixed into every public SDK feature component.
 *
 * @typeParam TResourceKey - The i18n resource namespace key whose dictionary entries can be overridden.
 * @public
 */
export interface BaseComponentInterface<
  TResourceKey extends keyof Resources = keyof Resources,
> extends CommonComponentInterface<TResourceKey> {
  /**
   * Custom React component rendered in place of the component when an unhandled error is caught
   * by the component-level error boundary. Receives `error` and `resetErrorBoundary` as props.
   * Defaults to the SDK's built-in `InternalError` fallback.
   */
  FallbackComponent?: (props: FallbackProps) => JSX.Element
  /**
   * Custom loading indicator rendered while the component's async data is fetching.
   * Overrides the indicator configured on `GustoProvider` for this component instance only.
   */
  LoaderComponent?: (props: { children?: React.ReactNode }) => JSX.Element
  /**
   * Callback invoked each time the component emits an event — user interactions, successful API
   * responses, step transitions, or errors. Receives the event type constant and an optional
   * payload whose shape varies by event. See the [Event Handling guide](https://docs.gusto.com/embedded-payroll/docs/event-handling)
   * and each component's event table for the full list of emitted events.
   */
  onEvent: OnEventType<EventType, unknown>
}

interface InternalBaseComponentProps {
  componentName?: string
}

/**
 * Wraps SDK feature components with the standard error boundary, suspense fallback, form-submission handler, and observability wiring.
 *
 * @remarks
 * Provides a {@link BaseContext} value to descendants exposing `error`, `setError`, `onEvent`, and
 * `baseSubmitHandler`, then renders children inside {@link BaseBoundaries} and {@link BaseLayout}.
 * Errors caught by the React error boundary are normalized, emitted to observability, and re-emitted
 * via `onEvent`.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `componentEvents.ERROR` | Emitted when an unhandled rendering error is caught by the component's error boundary | The raw error value caught by the boundary |
 *
 * @typeParam TResourceKey - The i18n resource namespace key whose dictionary entries can be overridden.
 * @param props - Component props extending {@link BaseComponentInterface}.
 * @returns A React element wrapping `children` with the SDK's standard error, loading, and event-emission surface.
 * @internal
 */
export const BaseComponent = <TResourceKey extends keyof Resources = keyof Resources>({
  children,
  FallbackComponent = InternalError,
  LoaderComponent: LoadingIndicatorFromProps,
  onEvent,
  componentName,
}: BaseComponentInterface<TResourceKey> & InternalBaseComponentProps) => {
  const { error, baseSubmitHandler, setError } = useBaseSubmit(componentName)
  const { observability } = useObservability()

  const { LoadingIndicator: LoadingIndicatorFromContext } = useLoadingIndicator()
  const LoaderComponent = LoadingIndicatorFromProps ?? LoadingIndicatorFromContext

  const onErrorBoundaryError = (boundaryError: unknown, errorInfo: ErrorInfo) => {
    onEvent(componentEvents.ERROR, boundaryError)

    const sdkError = normalizeToSDKError(boundaryError)

    observability?.onError?.({
      ...sdkError,
      timestamp: Date.now(),
      componentName,
      componentStack: errorInfo.componentStack ?? undefined,
    })
  }

  return (
    <BaseContext.Provider
      value={{
        error,
        setError,
        onEvent,
        baseSubmitHandler,
        LoadingIndicator: LoaderComponent,
        componentName,
      }}
    >
      <BaseBoundaries
        FallbackComponent={FallbackComponent}
        onErrorBoundaryError={onErrorBoundaryError}
        componentName={componentName}
      >
        <BaseLayout error={error}>{children}</BaseLayout>
      </BaseBoundaries>
    </BaseContext.Provider>
  )
}

/** @internal */
export interface BaseLayoutProps {
  children?: ReactNode
  error?: SDKError | SDKError[] | null
  isLoading?: boolean
}

function SingleErrorContent({ error }: { error: SDKError }) {
  const Components = useComponentContext()
  const { t } = useTranslation()
  const hasFieldErrors = error.fieldErrors.length > 0

  return (
    <Components.Alert label={t('status.errorEncountered')} status="error">
      {hasFieldErrors && (
        <Components.UnorderedList
          items={error.fieldErrors
            .filter(fieldError => fieldError.message)
            .map(fieldError => (
              <span key={fieldError.field}>{fieldError.message}</span>
            ))}
        />
      )}
      {!hasFieldErrors && error.category === 'validation_error' && (
        <Components.Text as="pre">
          {error.raw &&
          typeof error.raw === 'object' &&
          'pretty' in error.raw &&
          typeof (error.raw as { pretty: unknown }).pretty === 'function'
            ? (error.raw as { pretty: () => string }).pretty()
            : error.message}
        </Components.Text>
      )}
      {!hasFieldErrors && error.category !== 'validation_error' && (
        <Components.Text>{error.message || t('errors.unknownError')}</Components.Text>
      )}
    </Components.Alert>
  )
}

function MultipleErrorsContent({ errors }: { errors: SDKError[] }) {
  const Components = useComponentContext()
  const { t } = useTranslation()

  return (
    <Components.Alert label={t('status.multipleErrorsEncountered')} status="error">
      <Components.UnorderedList
        items={errors
          .filter(error => error.message || error.fieldErrors.length > 0)
          .map((error, index) => {
            const visibleFieldErrors = error.fieldErrors.filter(fieldError => fieldError.message)

            if (visibleFieldErrors.length === 0) {
              return <span key={index}>{error.message || t('errors.unknownError')}</span>
            }

            return (
              <span key={index}>
                {error.message || t('errors.unknownError')}
                <Components.UnorderedList
                  items={visibleFieldErrors.map(fieldError => (
                    <span key={fieldError.field}>{fieldError.message}</span>
                  ))}
                />
              </span>
            )
          })}
      />
    </Components.Alert>
  )
}

/**
 * Renders the standard SDK layout with normalized error display, suspense-aware loading state, and the children content.
 *
 * @remarks
 * When `isLoading` is true and there are no errors, renders the configured loading indicator.
 * Otherwise renders a fade-in wrapper that displays a single error alert, an aggregated alert when
 * multiple errors are present, or no alert when errors are absent. Field-level errors are rendered
 * as a list, validation errors as preformatted Zod output, and all other errors as a generic
 * message — see {@link https://github.com/Gusto/embedded-react-sdk/blob/main/docs/integration-guide/error-handling.md | the Error Handling guide}.
 *
 * @param props - Component props matching {@link BaseLayoutProps}.
 * @returns A React element with the SDK's standard error rendering and loading behavior wrapped around `children`.
 * @internal
 */
export const BaseLayout = ({ children, error, isLoading }: BaseLayoutProps) => {
  const { LoadingIndicator } = useLoadingIndicator()

  const errors = Array.isArray(error) ? error : error ? [error] : []
  const hasErrors = errors.length > 0

  if (isLoading && !hasErrors) {
    return <LoadingIndicator />
  }

  const [firstError] = errors

  return (
    <FadeIn>
      {errors.length > 1 && <MultipleErrorsContent errors={errors} />}
      {errors.length === 1 && firstError && <SingleErrorContent error={firstError} />}
      {children}
    </FadeIn>
  )
}

interface LoaderWithMetricsProps {
  LoaderComponent: LoadingIndicatorContextProps['LoadingIndicator']
  observability: ReturnType<typeof useObservability>['observability']
  componentName?: string
}

const LoaderWithMetrics = ({
  LoaderComponent,
  observability,
  componentName,
}: LoaderWithMetricsProps) => {
  const loadingStartTime = useRef(Date.now())
  const observabilityRef = useRef(observability)
  const componentNameRef = useRef(componentName)

  useEffect(() => {
    observabilityRef.current = observability
    componentNameRef.current = componentName
  }, [observability, componentName])

  useEffect(() => {
    return () => {
      const duration = Date.now() - loadingStartTime.current
      observabilityRef.current?.onMetric?.({
        name: 'sdk.component.loading_duration',
        value: duration,
        unit: 'ms',
        tags: componentNameRef.current ? { component: componentNameRef.current } : undefined,
        timestamp: Date.now(),
      })
    }
  }, [])

  return <LoaderComponent />
}

function SuspenseFallback({ componentName }: { componentName?: string }) {
  const { LoadingIndicator } = useLoadingIndicator()
  const { observability } = useObservability()
  return (
    <LoaderWithMetrics
      LoaderComponent={LoadingIndicator}
      observability={observability}
      componentName={componentName}
    />
  )
}

/** @internal */
export interface BaseBoundariesProps {
  children?: ReactNode
  FallbackComponent?: (props: FallbackProps) => JSX.Element
  onErrorBoundaryError?: (error: unknown, info: ErrorInfo) => void
  componentName?: string
}

/**
 * Composes the SDK's React error boundary, TanStack Query reset boundary, and Suspense fallback around children.
 *
 * @remarks
 * Resetting the error boundary also resets any TanStack Query errors so suspended queries refetch
 * cleanly. While children suspend, a metrics-instrumented loading indicator is rendered that emits
 * an `sdk.component.loading_duration` observability metric on unmount.
 *
 * @param props - Component props matching {@link BaseBoundariesProps}.
 * @returns A React element wrapping `children` with the SDK's error and suspense boundaries.
 * @internal
 */
export const BaseBoundaries = ({
  children,
  FallbackComponent = InternalError,
  onErrorBoundaryError,
  componentName,
}: BaseBoundariesProps) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset: resetQueries }) => (
        <ErrorBoundary
          FallbackComponent={FallbackComponent}
          onReset={resetQueries}
          onError={onErrorBoundaryError}
        >
          <Suspense fallback={<SuspenseFallback componentName={componentName} />}>
            {children}
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
