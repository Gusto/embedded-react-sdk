import type { ReactNode, FC, JSX } from 'react'
import { Suspense, useState, useContext, createContext, useCallback } from 'react'
import type { FallbackProps } from 'react-error-boundary'
import { ErrorBoundary } from 'react-error-boundary'
import { useTranslation } from 'react-i18next'
import { APIError } from '@gusto/embedded-api/models/errors/apierror'
import { SDKValidationError } from '@gusto/embedded-api/models/errors/sdkvalidationerror'
import { UnprocessableEntityErrorObject } from '@gusto/embedded-api/models/errors/unprocessableentityerrorobject'
import type { EntityErrorObject } from '@gusto/embedded-api/models/components/entityerrorobject'
import { componentEvents, type EventType } from '@/shared/constants'
import { Alert, InternalError, Loading, useAsyncError } from '@/components/Common'
import { snakeCaseToCamelCase } from '@/helpers/formattedStrings'

// Define types
export type OnEventType<K, T> = (type: K, data?: T) => void

export interface CommonComponentInterface {
  children?: ReactNode
  className?: string
  defaultValues?: unknown
}

// Base component wrapper with error and suspense handling
export interface BaseComponentInterface {
  FallbackComponent?: (props: FallbackProps) => JSX.Element
  LoaderComponent?: () => JSX.Element
  onEvent: OnEventType<EventType, unknown>
  children?: ReactNode
}

type KnownErrors = APIError | SDKValidationError | UnprocessableEntityErrorObject

type FieldError = {
  key: string
  message: string
}
interface BaseContextProps {
  fieldErrors: FieldError[] | null
  setError: (err: KnownErrors) => void
  onEvent: OnEventType<EventType, unknown>
  throwError: (e: unknown) => void
  baseSubmitHandler: <T>(
    formData: T,
    componentHandler: (payload: T) => Promise<void>,
  ) => Promise<void>
}

const BaseContext = createContext<BaseContextProps | undefined>(undefined)

export const useBase = () => {
  const context = useContext(BaseContext)
  if (!context) {
    throw new Error('useBase must be used within a BaseProvider')
  }
  return context
}

/**Traverses errorList and finds items with message properties */
const renderErrorList = (errorList: FieldError[]): React.ReactNode => {
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
  if (error.category === 'invalid_attribute_value') {
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

export const BaseComponent: FC<BaseComponentInterface> = ({
  children,
  FallbackComponent = InternalError,
  LoaderComponent = Loading,
  onEvent,
}) => {
  const [error, setError] = useState<KnownErrors | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldError[] | null>(null)
  const throwError = useAsyncError()
  const { t } = useTranslation()

  const processError = (error: KnownErrors) => {
    // //Legacy React SDK error class:
    // //TODO: remove once switched to speakeasy
    // if (error instanceof ApiError) {
    //   setFieldErrors(error.errorList ? error.errorList.flatMap(err => getFieldErrors(err)) : null)
    // }

    //Speakeasy response handling
    // The server response does not match the expected SDK schema
    if (error instanceof SDKValidationError) {
      setError(error)
    }
    //422	application/json - content relaited error
    if (error instanceof UnprocessableEntityErrorObject) {
      setError(error)
      setFieldErrors(error.errors ? error.errors.flatMap(err => getFieldErrors(err)) : null)
    }
    //Speakeasy embedded api error class 4XX, 5XX	*/*
    if (error instanceof APIError) {
      setError(error)
    }
  }

  const baseSubmitHandler = useCallback(
    async <T,>(data: T, componentHandler: SubmitHandler<T>) => {
      setError(null)
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
        setError,
        onEvent,
        throwError,
        baseSubmitHandler,
      }}
    >
      <Suspense fallback={<LoaderComponent />}>
        <ErrorBoundary
          FallbackComponent={FallbackComponent}
          onError={err => {
            onEvent(componentEvents.ERROR, err)
          }}
        >
          {(error || fieldErrors) && (
            <Alert label={t('status.errorEncountered')} variant="error">
              {fieldErrors && <ul>{renderErrorList(fieldErrors)}</ul>}
            </Alert>
          )}
          {children}
        </ErrorBoundary>
      </Suspense>
    </BaseContext.Provider>
  )
}

export function createCompoundContext<T>(contextName: string, defaultValue: T | null = null) {
  const context = createContext<T | null>(defaultValue)

  const useCompoundContext = () => {
    const ctx = useContext(context)
    if (!ctx) {
      throw new Error(`${contextName} must be used within its Provider.`)
    }
    return ctx
  }

  return [useCompoundContext, context.Provider] as const
}
