import { createContext, useContext } from 'react'
import type { APIError } from '@gusto/embedded-api/models/errors/apierror'
import type { SDKValidationError } from '@gusto/embedded-api/models/errors/sdkvalidationerror'
import type { UnprocessableEntityErrorObject } from '@gusto/embedded-api/models/errors/unprocessableentityerrorobject'
import { type EventType } from '@/shared/constants'

export type OnEventType<K, T> = (type: K, data?: T) => void

export type KnownErrors = APIError | SDKValidationError | UnprocessableEntityErrorObject

export type FieldError = {
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

export const BaseContext = createContext<BaseContextProps | undefined>(undefined)

export const useBase = () => {
  const context = useContext(BaseContext)
  if (!context) {
    throw new Error('useBase must be used within a BaseProvider')
  }
  return context
}
