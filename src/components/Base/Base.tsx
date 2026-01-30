import type { ReactNode, JSX, ErrorInfo } from 'react'
import { Suspense } from 'react'
import type { FallbackProps } from 'react-error-boundary'
import { ErrorBoundary } from 'react-error-boundary'
import { useTranslation } from 'react-i18next'
import { APIError } from '@gusto/embedded-api/models/errors/apierror'
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

export const BaseComponent = <TResourceKey extends keyof Resources = keyof Resources>({
  children,
  FallbackComponent = InternalError,
  LoaderComponent: LoadingIndicatorFromProps,
  onEvent,
}: BaseComponentInterface<TResourceKey>) => {
  const { error, fieldErrors, baseSubmitHandler, setError } = useBaseSubmit()

  const { LoadingIndicator: LoadingIndicatorFromContext } = useLoadingIndicator()
  const LoaderComponent = LoadingIndicatorFromProps ?? LoadingIndicatorFromContext

  const onErrorBoundaryError = (error: unknown) => {
    onEvent(componentEvents.ERROR, error)
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
      }}
    >
      <BaseBoundaries
        FallbackComponent={FallbackComponent}
        LoaderComponent={LoaderComponent}
        onErrorBoundaryError={onErrorBoundaryError}
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

  return (
    <FadeIn>
      {(error || fieldErrors) && (
        <Components.Alert label={t('status.errorEncountered')} status="error">
          {fieldErrors && <Components.UnorderedList items={renderErrorList(fieldErrors)} />}
          {error && error instanceof APIError && <Components.Text>{error.message}</Components.Text>}
          {error && error instanceof SDKValidationError && (
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
}

export const BaseBoundaries = ({
  children,
  FallbackComponent = InternalError,
  LoaderComponent: LoadingIndicatorFromProps,
  onErrorBoundaryError,
}: BaseBoundariesProps) => {
  const { LoadingIndicator: LoadingIndicatorFromContext } = useLoadingIndicator()
  const LoaderComponent = LoadingIndicatorFromProps ?? LoadingIndicatorFromContext

  return (
    <QueryErrorResetBoundary>
      {({ reset: resetQueries }) => (
        <ErrorBoundary
          FallbackComponent={FallbackComponent}
          onReset={resetQueries}
          onError={onErrorBoundaryError}
        >
          <Suspense fallback={<LoaderComponent />}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
