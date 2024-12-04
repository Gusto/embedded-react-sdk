import { Suspense, useState, useContext, createContext, ReactNode, FC } from 'react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { Alert, InternalError, Loading, useAsyncError } from '@/components/Common'
import { componentEvents, type EventType } from '@/shared/constants'
import { ApiError, ApiErrorMessage } from '@/api/queries/helpers'
import { useTranslation } from 'react-i18next'

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

interface BaseContextProps {
  error: ApiError | null
  setError: (err: ApiError) => void
  onEvent: OnEventType<EventType, unknown>
  throwError: (e: unknown) => void
}

const BaseContext = createContext<BaseContextProps | undefined>(undefined)

export const useBase = () => {
  const context = useContext(BaseContext)
  if (!context) {
    throw new Error('useBase must be used within a BaseProvider')
  }
  return context
}

export const BaseComponent: FC<BaseComponentInterface> = ({
  children,
  FallbackComponent = InternalError,
  LoaderComponent = Loading,
  onEvent,
}) => {
  const [error, setError] = useState<ApiError | null>(null)
  const throwError = useAsyncError()
  const { t } = useTranslation()

  const renderErrorList = (errorList: ApiErrorMessage[], prefix?: string): React.ReactNode => {
    return errorList.map(errorFromList => {
      if (errorFromList.message) {
        return (
          <li key={errorFromList.error_key}>
            {prefix && `${prefix} `}
            {errorFromList.message}
          </li>
        )
      } else if (errorFromList.errors) {
        return renderErrorList(
          errorFromList.errors,
          prefix || errorFromList.metadata
            ? (prefix ? prefix : '') +
                `${errorFromList.metadata ? Object.values(errorFromList.metadata).join(',') : ''}:`
            : undefined,
        )
      }
    })
  }
  return (
    <BaseContext.Provider
      value={{
        error,
        setError,
        onEvent,
        throwError,
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

export function createCompoundContext<T>(contextName: string) {
  const context = createContext<T | null>(null)

  const useCompoundContext = () => {
    const ctx = useContext(context)
    if (!ctx) {
      throw new Error(`${contextName} must be used within its Provider.`)
    }
    return ctx
  }

  return [useCompoundContext, context.Provider] as const
}
