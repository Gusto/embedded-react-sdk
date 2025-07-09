import type { ReactNode } from 'react'
import { LoadingIndicatorContext, type LoadingIndicatorContextProps } from './useLoadingIndicator'
import { Loading } from '@/components/Common/Loading/Loading'

export interface LoadingIndicatorProviderProps {
  children: ReactNode
  value?: LoadingIndicatorContextProps['LoadingIndicator']
}

export function LoadingIndicatorProvider({ children, value }: LoadingIndicatorProviderProps) {
  return (
    <LoadingIndicatorContext.Provider value={{ LoadingIndicator: value ?? Loading }}>
      {children}
    </LoadingIndicatorContext.Provider>
  )
}
