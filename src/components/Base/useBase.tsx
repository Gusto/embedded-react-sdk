import { createContext, useContext } from 'react'
import { type EventType } from '@/shared/constants'
import type { LoadingIndicatorContextProps } from '@/contexts/LoadingIndicatorProvider/useLoadingIndicator'
import type { SDKError } from '@/types/sdkError'

export type OnEventType<K, T> = (type: K, data?: T) => void

interface BaseContextProps {
  error: SDKError | null
  setError: (err: SDKError | null) => void
  onEvent: OnEventType<EventType, unknown>
  baseSubmitHandler: <T>(
    formData: T,
    componentHandler: (payload: T) => Promise<void>,
  ) => Promise<void>
  LoadingIndicator: LoadingIndicatorContextProps['LoadingIndicator']
  componentName?: string
}

export const BaseContext = createContext<BaseContextProps | undefined>(undefined)

export const useBase = () => {
  const context = useContext(BaseContext)
  if (!context) {
    throw new Error('useBase must be used within a BaseProvider')
  }
  return context
}
