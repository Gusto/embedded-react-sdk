import {
  Suspense,
  useState,
  useContext,
  createContext,
  ReactNode,
  FC,
  useCallback,
  JSX,
} from 'react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { useTranslation } from 'react-i18next'
import { Alert, InternalError, Loading, useAsyncError } from '@/components/Common'
import { componentEvents, type EventType } from '@/shared/constants'
import { ApiError, ApiErrorMessage } from '@/api/queries/helpers'

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

type FieldError = {
  key: string
  message: string
}
interface BaseContextProps {
  error: ApiError | null
  fieldErrors: FieldError[] | null
  setError: (err: ApiError) => void
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

/**Recuresively traverses errorList and finds items with message propertys */
const renderErrorList = (errorList: ApiErrorMessage[]): React.ReactNode => {
  return errorList.map(errorFromList => {
    if (errorFromList.message) {
      return <li key={errorFromList.error_key}>{errorFromList.message}</li>
    } else if (errorFromList.errors) {
      return renderErrorList(errorFromList.errors)
    }
    return null
  })
}
/**Recuresively parses error list and constructs an array of objects containing attribute value error messages associated with form fields. Nested errors construct '.' separated keys
 * metadata.state is a special case for state taxes validation errors
 */
const getFieldErrors = (
  error: ApiErrorMessage,
  parentKey?: string,
): { key: string; message: string }[] => {
  const keyPrefix = parentKey ? parentKey + '.' : ''
  if (error.category === 'invalid_attribute_value') {
    return [
      {
        key: keyPrefix + error.error_key,
        message: error.message ?? '',
      },
    ]
  }
  if (error.category === 'nested_errors' && error.errors !== undefined) {
    return error.errors.flatMap(err =>
      getFieldErrors(
        err,
        keyPrefix + ((error.metadata?.key || error.metadata?.state) ?? error.error_key),
      ),
    )
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
  const [error, setError] = useState<ApiError | null>(null)
  const throwError = useAsyncError()
  const { t } = useTranslation()

  const baseSubmitHandler = useCallback(
    async <T,>(data: T, componentHandler: SubmitHandler<T>) => {
      setError(null)
      try {
        await componentHandler(data)
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err)
        } else throwError(err)
      }
    },
    [setError, throwError],
  )

  return (
    <BaseContext.Provider
      value={{
        error,
        fieldErrors: error?.errorList ? error.errorList.flatMap(err => getFieldErrors(err)) : null,
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
          {error && (
            <Alert label={t('status.errorEncountered')} variant="error">
              {error.errorList?.length && <ul>{renderErrorList(error.errorList)}</ul>}
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
