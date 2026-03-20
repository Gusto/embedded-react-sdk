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

export interface CommonComponentInterface<TResourceKey extends keyof Resources = keyof Resources> {
  children?: ReactNode
  className?: string
  defaultValues?: unknown
  dictionary?: ResourceDictionary<TResourceKey>
}

export interface BaseComponentInterface<
  TResourceKey extends keyof Resources = keyof Resources,
> extends CommonComponentInterface<TResourceKey> {
  FallbackComponent?: BaseBoundariesProps['FallbackComponent']
  LoaderComponent?: LoadingIndicatorContextProps['LoadingIndicator']
  onEvent: OnEventType<EventType, unknown>
}

interface InternalBaseComponentProps {
  componentName?: string
}

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
      >
        <Suspense
          fallback={
            <LoaderWithMetrics
              LoaderComponent={LoaderComponent}
              observability={observability}
              componentName={componentName}
            />
          }
        >
          <BaseLayout error={error}>{children}</BaseLayout>
        </Suspense>
      </BaseBoundaries>
    </BaseContext.Provider>
  )
}

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

export interface BaseBoundariesProps {
  children?: ReactNode
  FallbackComponent?: (props: FallbackProps) => JSX.Element
  onErrorBoundaryError?: (error: unknown, info: ErrorInfo) => void
}

export const BaseBoundaries = ({
  children,
  FallbackComponent = InternalError,
  onErrorBoundaryError,
}: BaseBoundariesProps) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset: resetQueries }) => (
        <ErrorBoundary
          FallbackComponent={FallbackComponent}
          onReset={resetQueries}
          onError={onErrorBoundaryError}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
