import type { ReactNode } from 'react'
import type { HookError } from './types'
import type { LoadingIndicatorContextProps } from '@/contexts/LoadingIndicatorProvider/useLoadingIndicator'
import { FadeIn } from '@/components/Common/FadeIn/FadeIn'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useLoadingIndicator } from '@/contexts/LoadingIndicatorProvider/useLoadingIndicator'

export interface HookBaseComponentProps {
  children: ReactNode
  isLoading: boolean
  error: HookError | null
  retry?: () => void
  LoaderComponent?: LoadingIndicatorContextProps['LoadingIndicator']
}

export function HookBaseComponent({
  children,
  isLoading,
  error,
  retry,
  LoaderComponent: LoaderComponentFromProps,
}: HookBaseComponentProps) {
  const { LoadingIndicator: LoaderComponentFromContext } = useLoadingIndicator()
  const LoaderComponent = LoaderComponentFromProps ?? LoaderComponentFromContext

  if (isLoading) {
    return <LoaderComponent />
  }

  return (
    <HookBaseLayout error={error} retry={retry}>
      {children}
    </HookBaseLayout>
  )
}

function HookBaseLayout({
  children,
  error,
  retry,
}: {
  children: ReactNode
  error: HookError | null
  retry?: () => void
}) {
  const Components = useComponentContext()

  return (
    <FadeIn>
      {error && (
        <Components.Alert label={error.title} status="error">
          {error.fieldErrors.length > 0 && (
            <Components.UnorderedList
              items={error.fieldErrors.map(fe => (
                <span key={fe.field}>{fe.message}</span>
              ))}
            />
          )}
          {error.description && <Components.Text>{error.description}</Components.Text>}
          {retry && (
            <button type="button" onClick={retry}>
              Retry
            </button>
          )}
        </Components.Alert>
      )}
      {children}
    </FadeIn>
  )
}
