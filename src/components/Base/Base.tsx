import type { ReactNode, JSX, ErrorInfo } from 'react'
import { Suspense, useEffect, useRef } from 'react'
import type { FallbackProps } from 'react-error-boundary'
import { ErrorBoundary } from 'react-error-boundary'
import { useTranslation } from 'react-i18next'
import { GustoEmbeddedError } from '@gusto/embedded-api/models/errors/gustoembeddederror'
import { SDKValidationError } from '@gusto/embedded-api/models/errors/sdkvalidationerror'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import type { EntityErrorObject } from '@gusto/embedded-api/models/components/entityerrorobject'
import { FadeIn } from '../Common/FadeIn/FadeIn'
import { BaseContext, type KnownErrors, type OnEventType } from './useBase'
import { useBaseSubmit } from './useBaseSubmit'
import { componentEvents, type EventType } from '@/shared/constants'
import { InternalError } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import type { ResourceDictionary, Resources } from '@/types/Helpers'
import { useLoadingIndicator } from '@/contexts/LoadingIndicatorProvider/useLoadingIndicator'
import type { LoadingIndicatorContextProps } from '@/contexts/LoadingIndicatorProvider/useLoadingIndicator'
import { useObservability } from '@/contexts/ObservabilityProvider/useObservability'
import { renderErrorList } from '@/helpers/apiErrorToList'

export interface CommonComponentInterface<TResourceKey extends keyof Resources = keyof Resources> {
  children?: ReactNode
  className?: string
  defaultValues?: unknown
  dictionary?: ResourceDictionary<TResourceKey>
}

// Base component wrapper with error and suspense handling
export interface BaseComponentInterface<
  TResourceKey extends keyof Resources = keyof Resources,
> extends CommonComponentInterface<TResourceKey> {
  FallbackComponent?: BaseBoundariesProps['FallbackComponent']
  LoaderComponent?: BaseBoundariesProps['LoaderComponent']
  onEvent: OnEventType<EventType, unknown>
}

// Internal prop for SDK components to set their component name
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
  const { error, fieldErrors, baseSubmitHandler, setError } = useBaseSubmit(componentName)
  const { observability } = useObservability()

  const { LoadingIndicator: LoadingIndicatorFromContext } = useLoadingIndicator()
  const LoaderComponent = LoadingIndicatorFromProps ?? LoadingIndicatorFromContext

  const onErrorBoundaryError = (error: unknown, errorInfo: ErrorInfo) => {
    onEvent(componentEvents.ERROR, error)

    observability?.onError?.({
      type: 'boundary_error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      context: {
        componentName,
        componentStack: errorInfo.componentStack ?? undefined,
      },
      originalError: error,
      timestamp: Date.now(),
    })
  }

  return (
    <BaseContext.Provider
      value={{
        error,
        fieldErrors,
        setError,
        onEvent,
        baseSubmitHandler,
        LoadingIndicator: LoaderComponent,
        componentName,
      }}
    >
      <BaseBoundaries
        FallbackComponent={FallbackComponent}
        LoaderComponent={LoaderComponent}
        onErrorBoundaryError={onErrorBoundaryError}
        componentName={componentName}
      >
        <BaseLayout error={error} fieldErrors={fieldErrors}>
          {children}
        </BaseLayout>
      </BaseBoundaries>
    </BaseContext.Provider>
  )
}

interface BaseLayoutProps {
  children?: ReactNode
  error: KnownErrors | null
  fieldErrors: Array<EntityErrorObject> | null
}

export const BaseLayout = ({ children, error, fieldErrors }: BaseLayoutProps) => {
  const Components = useComponentContext()
  const { t } = useTranslation()
  const hasDisplayableFieldErrors = Boolean(fieldErrors?.length)

  return (
    <FadeIn>
      {(error || fieldErrors) && (
        <Components.Alert label={t('status.errorEncountered')} status="error">
          {hasDisplayableFieldErrors && (
            <Components.UnorderedList items={renderErrorList(fieldErrors!)} />
          )}
          {!hasDisplayableFieldErrors && error instanceof GustoEmbeddedError && (
            <Components.Text>{t('errors.unknownError')}</Components.Text>
          )}
          {!hasDisplayableFieldErrors && error instanceof SDKValidationError && (
            <Components.Text as="pre">{error.pretty()}</Components.Text>
          )}
        </Components.Alert>
      )}
      {children}
    </FadeIn>
  )
}

export interface BaseBoundariesProps {
  children?: ReactNode
  FallbackComponent?: (props: FallbackProps) => JSX.Element
  LoaderComponent?: LoadingIndicatorContextProps['LoadingIndicator']
  onErrorBoundaryError?: (error: unknown, info: ErrorInfo) => void
  componentName?: string
}

export const BaseBoundaries = ({
  children,
  FallbackComponent = InternalError,
  LoaderComponent: LoadingIndicatorFromProps,
  onErrorBoundaryError,
  componentName,
}: BaseBoundariesProps) => {
  const { LoadingIndicator: LoadingIndicatorFromContext } = useLoadingIndicator()
  const LoaderComponent = LoadingIndicatorFromProps ?? LoadingIndicatorFromContext
  const { observability } = useObservability()

  // Wrapper to track loading duration
  const LoaderWithMetrics = () => {
    const loadingStartTime = useRef(Date.now())

    useEffect(() => {
      // When this component unmounts, loading is complete
      return () => {
        const duration = Date.now() - loadingStartTime.current
        observability?.onMetric?.({
          name: 'sdk.component.loading_duration',
          value: duration,
          unit: 'ms',
          tags: componentName ? { component: componentName } : undefined,
          timestamp: Date.now(),
        })
      }
    }, [])

    return <LoaderComponent />
  }

  return (
    <QueryErrorResetBoundary>
      {({ reset: resetQueries }) => (
        <ErrorBoundary
          FallbackComponent={FallbackComponent}
          onReset={resetQueries}
          onError={onErrorBoundaryError}
        >
          <Suspense fallback={<LoaderWithMetrics />}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
