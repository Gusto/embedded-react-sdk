import { ApiError } from '@/api/queries/helpers'
import { createContext } from 'react'
import { OnEventType } from './Base'

export interface BaseContextProps {
  error: ApiError | null
  setError: (err: ApiError) => void
  onEvent: OnEventType<string, unknown>
  throwError: (e: unknown) => void
}

export const BaseContext = createContext<BaseContextProps | undefined>(undefined)
