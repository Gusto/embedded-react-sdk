import { useContext } from 'react'
import { ObservabilityContext } from './ObservabilityContext'
import type { ObservabilityContextValue } from './ObservabilityContext'

export const useObservability = (): ObservabilityContextValue => {
  const context = useContext(ObservabilityContext)
  if (context === undefined) {
    return { observability: undefined }
  }
  return context
}
