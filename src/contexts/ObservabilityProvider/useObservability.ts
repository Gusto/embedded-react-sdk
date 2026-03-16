import { useContext } from 'react'
import { ObservabilityContext } from './ObservabilityContext'
import type { ObservabilityContextValue } from './ObservabilityContext'
import { useSanitizedObservability } from './useSanitizedObservability'

export const useObservability = (): ObservabilityContextValue => {
  const context = useContext(ObservabilityContext)
  if (context === undefined) {
    return { observability: undefined }
  }

  const sanitizedObservability = useSanitizedObservability(context.observability)

  return { observability: sanitizedObservability }
}
