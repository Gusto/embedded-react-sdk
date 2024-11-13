import { Suspense, useState, useContext, createContext, ReactNode, FC } from 'react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { Alert, InternalError, Loading, useAsyncError } from '@/components/Common'
import { componentEvents } from '@/shared/constants'
import { ApiError, ApiErrorMessage } from '@/api/queries/helpers'
import { BaseContext } from './BaseContext'

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
  onEvent: OnEventType<string, unknown>
  children?: ReactNode
}

export const BaseComponent: FC<BaseComponentInterface> = ({
  children,
  FallbackComponent = InternalError,
  LoaderComponent = Loading,
  onEvent,
}) => {
  const [error, setError] = useState<ApiError | null>(null)
  const throwError = useAsyncError()

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
            <Alert label={error.message} variant="error">
              {error.errorList?.length && <ul>{renderErrorList(error.errorList)}</ul>}
            </Alert>
          )}
          {children}
        </ErrorBoundary>
      </Suspense>
    </BaseContext.Provider>
  )
}
