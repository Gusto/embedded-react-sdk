import type { ReactNode } from 'react'
import { fn } from 'storybook/test'
import { BaseContext } from '../../src/components/Base/useBase'
import { LoadingSpinner } from '../../src/components/Common/UI/LoadingSpinner'

const mockBaseContext = {
  error: null,
  fieldErrors: null,
  setError: fn().mockName('setError'),
  onEvent: fn().mockName('onEvent'),
  baseSubmitHandler: async <T,>(formData: T, componentHandler: (payload: T) => Promise<void>) => {
    await componentHandler(formData)
  },
  LoadingIndicator: () => <LoadingSpinner />,
}

export function MockBaseProvider({ children }: { children: ReactNode }) {
  return <BaseContext.Provider value={mockBaseContext}>{children}</BaseContext.Provider>
}
