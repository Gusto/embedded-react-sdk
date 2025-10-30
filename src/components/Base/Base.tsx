import type { ReactNode, JSX } from 'react'
import { Suspense, useState, useCallback } from 'react'
import type { FallbackProps } from 'react-error-boundary'
import { ErrorBoundary } from 'react-error-boundary'
import { useTranslation } from 'react-i18next'
import { APIError } from '@gusto/embedded-api/models/errors/apierror'
import { SDKValidationError } from '@gusto/embedded-api/models/errors/sdkvalidationerror'
import { UnprocessableEntityErrorObject } from '@gusto/embedded-api/models/errors/unprocessableentityerrorobject'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import type { EntityErrorObject } from '@gusto/embedded-api/models/components/entityerrorobject'
import { FadeIn } from '../Common/FadeIn/FadeIn'
import { BaseContext, type KnownErrors, type OnEventType } from './useBase'
import { componentEvents, type EventType } from '@/shared/constants'
import { InternalError } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import type { ResourceDictionary, Resources } from '@/types/Helpers'
import { useLoadingIndicator } from '@/contexts/LoadingIndicatorProvider/useLoadingIndicator'
import type { LoadingIndicatorContextProps } from '@/contexts/LoadingIndicatorProvider/useLoadingIndicator'
import { getFieldErrors, renderErrorList } from '@/helpers/apiErrorToList'
import { useAsyncError } from '@/hooks/useAsyncError'

export interface CommonComponentInterface<TResourceKey extends keyof Resources = keyof Resources> {
  children?: ReactNode
  className?: string
  defaultValues?: unknown
  dictionary?: ResourceDictionary<TResourceKey>
}

// Base component wrapper with error and suspense handling
export interface BaseComponentInterface<TResourceKey extends keyof Resources = keyof Resources>
  extends CommonComponentInterface<TResourceKey> {
  FallbackComponent?: (props: FallbackProps) => JSX.Element
  LoaderComponent?: LoadingIndicatorContextProps['LoadingIndicator']
  onEvent: OnEventType<EventType, unknown>
}

type SubmitHandler<T> = (data: T) => Promise<void>

export const BaseComponent = <TResourceKey extends keyof Resources = keyof Resources>({
  children,
  FallbackComponent = InternalError,
  LoaderComponent: LoadingIndicatorFromProps,
  onEvent,
}: BaseComponentInterface<TResourceKey>) => {
  const [error, setError] = useState<KnownErrors | null>(null)
  const [fieldErrors, setFieldErrors] = useState<EntityErrorObject[] | null>(null)
  const throwError = useAsyncError()
  const { t } = useTranslation()
  const Components = useComponentContext()

  const { LoadingIndicator: LoadingIndicatorFromContext } = useLoadingIndicator()

  const LoaderComponent = LoadingIndicatorFromProps ?? LoadingIndicatorFromContext

  // Enhanced setError that also clears fieldErrors when error is cleared
  const setErrorWithFieldsClear = useCallback((error: KnownErrors | null) => {
    setError(error)
    if (!error) {
      setFieldErrors(null)
    }
  }, [])

  const processError = (error: KnownErrors) => {
    setError(error)
    //422	application/json - content relaited error
    if (error instanceof UnprocessableEntityErrorObject && Array.isArray(error.errors)) {
      setFieldErrors(error.errors.flatMap(err => getFieldErrors(err)))
    }
  }

  const baseSubmitHandler = useCallback(
    async <T,>(data: T, componentHandler: SubmitHandler<T>) => {
      setError(null)
      setFieldErrors(null)
      try {
        await componentHandler(data)
      } catch (err) {
        if (
          err instanceof APIError ||
          err instanceof SDKValidationError ||
          err instanceof UnprocessableEntityErrorObject
        ) {
          processError(err)
        } else throwError(err)
      }
    },
    [setError, throwError],
  )

  return (
    <BaseContext.Provider
      value={{
        fieldErrors,
        setError: setErrorWithFieldsClear,
        onEvent,
        throwError,
        baseSubmitHandler,
        LoadingIndicator: LoaderComponent,
      }}
    >
      <QueryErrorResetBoundary>
        {({ reset: resetQueries }) => (
          <ErrorBoundary
            FallbackComponent={FallbackComponent}
            onReset={resetQueries}
            onError={err => {
              onEvent(componentEvents.ERROR, err)
            }}
          >
            {(error || fieldErrors) && (
              <Components.Alert label={t('status.errorEncountered')} status="error">
                {fieldErrors && <Components.UnorderedList items={renderErrorList(fieldErrors)} />}
                {error && error instanceof APIError && (
                  <Components.Text>{error.message}</Components.Text>
                )}
                {error && error instanceof SDKValidationError && (
                  <Components.Text as="pre">{error.pretty()}</Components.Text>
                )}
              </Components.Alert>
            )}
            <Suspense fallback={<LoaderComponent />}>
              <FadeIn>{children}</FadeIn>
            </Suspense>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </BaseContext.Provider>
  )
}
