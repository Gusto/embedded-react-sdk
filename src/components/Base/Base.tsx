import type { ReactNode, JSX } from 'react'
import { Suspense, useState, useCallback } from 'react'
import type { FallbackProps } from 'react-error-boundary'
import { ErrorBoundary } from 'react-error-boundary'
import { useTranslation } from 'react-i18next'
import { APIError } from '@gusto/embedded-api/models/errors/apierror'
import { SDKValidationError } from '@gusto/embedded-api/models/errors/sdkvalidationerror'
import { UnprocessableEntityErrorObject } from '@gusto/embedded-api/models/errors/unprocessableentityerrorobject'
import { UnprocessableEntityErrorObject1 } from '@gusto/embedded-api/models/errors/unprocessableentityerrorobject1'
import { PayrollBlockersError } from '@gusto/embedded-api/models/errors/payrollblockerserror'
import type { EntityErrorObject } from '@gusto/embedded-api/models/components/entityerrorobject'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { FadeIn } from '../Common/FadeIn/FadeIn'
import { BaseContext, type FieldError, type KnownErrors, type OnEventType } from './useBase'
import { PayrollBlockerAlerts } from '@/components/Payroll/PayrollBlocker/PayrollBlockerAlerts'
import {
  parseBlockersFromError,
  ERROR_MESSAGES,
} from '@/components/Payroll/PayrollBlocker/payrollHelpers'
import { componentEvents, type EventType } from '@/shared/constants'
import { InternalError, useAsyncError } from '@/components/Common'
import { snakeCaseToCamelCase } from '@/helpers/formattedStrings'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import type { ResourceDictionary, Resources } from '@/types/Helpers'
import { useLoadingIndicator } from '@/contexts/LoadingIndicatorProvider/useLoadingIndicator'
import type { LoadingIndicatorContextProps } from '@/contexts/LoadingIndicatorProvider/useLoadingIndicator'

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

/**Traverses errorList and finds items with message properties */
const renderErrorList = (errorList: FieldError[]): React.ReactNode[] => {
  return errorList.map(errorFromList => {
    if (errorFromList.message) {
      return <li key={errorFromList.key}>{errorFromList.message}</li>
    }
    return null
  })
}
/**Recuresively parses error list and constructs an array of objects containing attribute value error messages associated with form fields. Nested errors construct '.' separated keys
 * metadata.state is a special case for state taxes validation errors
 */
const getFieldErrors = (
  error: EntityErrorObject,
  parentKey?: string,
): { key: string; message: string }[] => {
  const keyPrefix = parentKey ? parentKey + '.' : ''
  if (error.category === 'invalid_attribute_value' || error.category === 'invalid_operation') {
    return [
      {
        key: snakeCaseToCamelCase(keyPrefix + error.errorKey),
        message: error.message ?? '',
      },
    ]
  }
  if (error.category === 'nested_errors' && error.errors !== undefined) {
    //TODO: clean this up once Metadata type is fixed in openapi spec
    let keySuffix = ''
    //@ts-expect-error: Metadata in speakeasy is incorrectly typed
    if (error.metadata?.key && typeof error.metadata.key === 'string') {
      //@ts-expect-error: Metadata in speakeasy is incorrectly typed
      keySuffix = error.metadata.key as string
      //@ts-expect-error: Metadata in speakeasy is incorrectly typed
    } else if (error.metadata?.state && typeof error.metadata.state === 'string') {
      //@ts-expect-error: Metadata in speakeasy is incorrectly typed
      keySuffix = error.metadata.state as string
    } else if (error.errorKey) {
      keySuffix = error.errorKey
    }
    return error.errors.flatMap(err => getFieldErrors(err, keyPrefix + keySuffix))
  }
  return []
}

type SubmitHandler<T> = (data: T) => Promise<void>

export const BaseComponent = <TResourceKey extends keyof Resources = keyof Resources>({
  children,
  FallbackComponent = InternalError,
  LoaderComponent: LoadingIndicatorFromProps,
  onEvent,
}: BaseComponentInterface<TResourceKey>) => {
  const [error, setError] = useState<KnownErrors | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldError[] | null>(null)
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
    //422	application/json - content related error
    if (
      (error instanceof UnprocessableEntityErrorObject && Array.isArray(error.errors)) ||
      (error instanceof UnprocessableEntityErrorObject1 && Array.isArray(error.errors))
    ) {
      setFieldErrors(error.errors.flatMap(err => getFieldErrors(err)))
    }
  }

  // Helper to check if error contains payroll blockers
  const hasPayrollBlockers = (error: KnownErrors): boolean => {
    if (error instanceof PayrollBlockersError) {
      return true
    }
    if (error instanceof UnprocessableEntityErrorObject1) {
      return (
        Array.isArray(error.errors) && error.errors.some(err => err.category === 'payroll_blocker')
      )
    }
    return false
  }

  const renderPayrollBlockerError = useCallback((error: KnownErrors) => {
    const apiBlockers = parseBlockersFromError(error)
    if (apiBlockers.length === 0) return null

    return <PayrollBlockerAlerts blockers={apiBlockers} />
  }, [])

  const GenericErrorAlert = useCallback(() => {
    if (!error && !fieldErrors) return null

    return (
      <Components.Alert label={t('status.errorEncountered')} status="error">
        {fieldErrors && <Components.UnorderedList items={renderErrorList(fieldErrors)} />}
        {error && error instanceof APIError && <Components.Text>{error.message}</Components.Text>}
        {error && error instanceof SDKValidationError && (
          <Components.Text as="pre">{error.pretty()}</Components.Text>
        )}
        {error && error instanceof PayrollBlockersError && error.errors && (
          <Components.UnorderedList
            items={error.errors.map(err => err.message || ERROR_MESSAGES.UNKNOWN_BLOCKER)}
          />
        )}
        {error &&
          error instanceof UnprocessableEntityErrorObject1 &&
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          error.errors && (
            <Components.UnorderedList
              items={error.errors
                .filter(err => err.category === 'payroll_blocker')
                .map(err => err.message || ERROR_MESSAGES.UNKNOWN_BLOCKER)}
            />
          )}
      </Components.Alert>
    )
  }, [error, fieldErrors, Components, t])

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
          err instanceof UnprocessableEntityErrorObject ||
          err instanceof UnprocessableEntityErrorObject1 ||
          err instanceof PayrollBlockersError
        ) {
          processError(err)
        } else {
          throwError(err)
        }
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
              <>
                {error && hasPayrollBlockers(error) ? (
                  renderPayrollBlockerError(error)
                ) : (
                  <GenericErrorAlert />
                )}
              </>
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
