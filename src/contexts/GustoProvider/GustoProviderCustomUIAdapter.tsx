import type React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { I18nextProvider } from 'react-i18next'
import { ReactSDKProvider } from '@gusto/embedded-api/ReactSDKProvider'
import type { CustomTypeOptions } from 'i18next'
import type { QueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { ComponentsProvider } from '../ComponentAdapter/ComponentsProvider'
import type { ComponentsContextType } from '../ComponentAdapter/useComponentContext'
import { SDKI18next } from './SDKI18next'
import { InternalError } from '@/components/Common'
import { LocaleProvider } from '@/contexts/LocaleProvider'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import type { GTheme } from '@/types/GTheme'
import type { DeepPartial } from '@/types/Helpers'

interface APIConfig {
  baseUrl: string
  headers?: Record<string, string | number>
}

type Resources = CustomTypeOptions['resources']

export type ResourceDictionary = Record<
  string,
  Partial<{ [K in keyof Resources]: DeepPartial<Resources[K]> }>
>

export interface GustoProviderProps {
  config: APIConfig
  dictionary?: ResourceDictionary
  lng?: string
  locale?: string
  currency?: string
  theme?: DeepPartial<GTheme>
  queryClient?: QueryClient
  components?: Partial<ComponentsContextType>
}

export interface GustoProviderCustomUIAdapterProps extends GustoProviderProps {
  children?: React.ReactNode
}

/**
 * A provider that accepts UI component adapters through the components prop
 */
const GustoProviderCustomUIAdapter: React.FC<GustoProviderCustomUIAdapterProps> = props => {
<<<<<<< HEAD
  const {
    children,
    config,
    dictionary,
    lng = 'en',
    locale = 'en-US',
    currency = 'USD',
    theme,
    components,
  } = props

  // Handle dictionary resources
  if (dictionary) {
    for (const language in dictionary) {
      for (const ns in dictionary[language]) {
        // Adding resources overrides to i18next instance - initial load will override common namespace and add component specific dictionaries provided by partners
        SDKI18next.addResourceBundle(
          language,
          ns,
          (dictionary[language] as Record<string, unknown>)[ns],
          true,
          true,
        )
      }
    }
  }

  // Handle language change
  useEffect(() => {
    void (async () => {
      await SDKI18next.changeLanguage(lng)
    })()
  }, [lng])
=======
  const { children, ...providerProps } = props
  const { config, lng, locale, currency, theme, components } = useGustoProvider(providerProps)
>>>>>>> 65c63cc (refactor: update gustoapiprovider to be gustoprovider plus support legacy implementations)

  return (
    <ComponentsProvider value={components as ComponentsContextType}>
      <ErrorBoundary FallbackComponent={InternalError}>
        <ThemeProvider theme={theme}>
          <LocaleProvider locale={locale} currency={currency}>
            <I18nextProvider i18n={SDKI18next} key={lng}>
              <ReactSDKProvider url={config.baseUrl}>{children}</ReactSDKProvider>
            </I18nextProvider>
          </LocaleProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </ComponentsProvider>
  )
}

export { GustoProviderCustomUIAdapter }
