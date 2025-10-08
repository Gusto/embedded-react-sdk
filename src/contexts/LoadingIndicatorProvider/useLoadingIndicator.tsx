import type { JSX } from 'react'
import { createContext, useContext } from 'react'
import { Loading } from '@/components/Common/Loading/Loading'

export interface LoadingIndicatorContextProps {
  LoadingIndicator: ({ children }: { children?: React.ReactNode }) => JSX.Element
}
export const LoadingIndicatorContext = createContext<LoadingIndicatorContextProps>({
  LoadingIndicator: ({ children }: { children?: React.ReactNode }) => <Loading>{children}</Loading>,
})

export const useLoadingIndicator = () => useContext(LoadingIndicatorContext)
