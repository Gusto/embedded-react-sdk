import type React from 'react'
// GustoProvider uses react-aria as the default components so we need to include the react-aria I18nProvider here.
// For use without react-aria, the GustoProviderCustomUIAdapter can be used which does not includes it.
// eslint-disable-next-line no-restricted-imports
import { I18nProvider } from 'react-aria-components'
import type { QueryClient } from '@tanstack/react-query'
import { createComponents } from '../ComponentAdapter/createComponentsWithDefaults'
import type { ComponentsContextType } from '../ComponentAdapter/useComponentContext'
import {
  GustoProviderCustomUIAdapter,
  type GustoProviderProps,
} from './GustoProviderCustomUIAdapter'

export interface GustoApiProps extends Omit<GustoProviderProps, 'components'> {
  queryClient?: QueryClient
  components?: Partial<ComponentsContextType>
  children?: React.ReactNode
}

const GustoProvider: React.FC<GustoApiProps> = props => {
  const { children, components = {}, locale, queryClient, ...remainingProps } = props

  return (
    <GustoProviderCustomUIAdapter
      locale={locale}
      queryClient={queryClient}
      {...remainingProps}
      components={createComponents(components)}
    >
      {/* react-aria locale provider that exposes correct locale to number formatters */}
      <I18nProvider locale={locale}>{children}</I18nProvider>
    </GustoProviderCustomUIAdapter>
  )
}

export { GustoProvider }

/** @deprecated Import from `GustoProvider` instead */
export const GustoApiProvider = GustoProvider
