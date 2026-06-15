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

/**
 * Props for {@link GustoProvider}.
 *
 * @remarks
 * Extends {@link GustoProviderProps} but makes `components` optional and partial: any components
 * you do not supply fall back to the SDK's built-in React Aria implementations.
 *
 * @public
 */
export interface GustoApiProps extends Omit<GustoProviderProps, 'components'> {
  /** Optional TanStack Query `QueryClient` to share with the rest of your app. When omitted, the SDK creates its own client configured for Gusto's API. */
  queryClient?: QueryClient
  /** Partial component overrides. Any component you do not supply uses the SDK's default React Aria implementation. */
  components?: Partial<ComponentsContextType>
  /** The application tree that should have access to the SDK. */
  children?: React.ReactNode
}

/**
 * Top-level provider that configures the SDK at the application level.
 *
 * @remarks
 * Wrap your application's component tree with `GustoProvider` so that any SDK component below it
 * has access to the API client, theme, locale, translations, and UI components. Components you
 * provide via the `components` prop override the SDK's React Aria defaults; any component you do
 * not supply uses the default.
 *
 * For full UI control without the bundled React Aria defaults, use {@link GustoProviderCustomUIAdapter}
 * instead and supply a complete component map.
 *
 * @param props - See {@link GustoApiProps}.
 * @returns The configured provider tree wrapping `children`.
 * @public
 */
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
