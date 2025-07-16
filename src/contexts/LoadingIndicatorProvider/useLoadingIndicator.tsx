import type { JSX } from 'react'
import { createContext, useContext } from 'react'
import { Loading } from '@/components/Common/Loading/Loading'

export interface LoadingIndicatorContextProps {
  LoadingIndicator: () => JSX.Element
}
export const LoadingIndicatorContext = createContext<LoadingIndicatorContextProps>({
  LoadingIndicator: () => <Loading />,
})

export const useLoadingIndicator = () => useContext(LoadingIndicatorContext)
