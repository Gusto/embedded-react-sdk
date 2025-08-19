import type React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { I18nextProvider } from 'react-i18next'
import type { QueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { ComponentsProvider } from '../ComponentAdapter/ComponentsProvider'
import type { ComponentsContextType } from '../ComponentAdapter/useComponentContext'
import { ApiProvider } from '../ApiProvider/ApiProvider'
import { LoadingIndicatorProvider } from '../LoadingIndicatorProvider/LoadingIndicatorProvider'
import type { LoadingIndicatorContextProps } from '../LoadingIndicatorProvider/useLoadingIndicator'
import { SDKI18next } from './SDKI18next'
import { InternalError } from '@/components/Common'
import { LocaleProvider } from '@/contexts/LocaleProvider'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import type { GustoSDKTheme } from '@/contexts/ThemeProvider/theme'
import type { ResourceDictionary, SupportedLanguages } from '@/types/Helpers'
import type { SDKHooks } from '@/types/hooks'

export interface APIConfig {
  baseUrl: string
  headers?: HeadersInit
  hooks?: SDKHooks
}

export interface GustoProviderProps {
  config: APIConfig
  dictionary?: ResourceDictionary
  lng?: string
  locale?: string
  currency?: string
  theme?: GustoSDKTheme
  queryClient?: QueryClient
  components: ComponentsContextType
  LoaderComponent?: LoadingIndicatorContextProps['LoadingIndicator']
}

export interface GustoProviderCustomUIAdapterProps extends GustoProviderProps {
  children?: React.ReactNode
}

/**
 * A provider that accepts UI component adapters through the components prop
 */
const GustoProviderCustomUIAdapter: React.FC<GustoProviderCustomUIAdapterProps> = props => {
  const {
    children,
    config,
    dictionary,
    lng = 'en',
    locale = 'en-US',
    currency = 'USD',
    theme,
    components,
    LoaderComponent,
  } = props

  // Handle dictionary resources
  if (dictionary) {
    for (const language in dictionary) {
      const lang = language as SupportedLanguages
      for (const ns in dictionary[lang]) {
        // Adding resources overrides to i18next instance - initial load will override common namespace and add component specific dictionaries provided by partners
        SDKI18next.addResourceBundle(
          lang,
          ns,
          (dictionary[lang] as Record<string, unknown>)[ns],
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

  return (
    <ComponentsProvider value={components}>
      <LoadingIndicatorProvider value={LoaderComponent}>
        <ErrorBoundary FallbackComponent={InternalError}>
          <ThemeProvider theme={theme}>
            <LocaleProvider locale={locale} currency={currency}>
              <I18nextProvider i18n={SDKI18next} key={lng}>
                <ApiProvider url={config.baseUrl} headers={config.headers} hooks={config.hooks}>
                  {children}
                </ApiProvider>
              </I18nextProvider>
            </LocaleProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </LoadingIndicatorProvider>
    </ComponentsProvider>
  )
}

export { GustoProviderCustomUIAdapter }
