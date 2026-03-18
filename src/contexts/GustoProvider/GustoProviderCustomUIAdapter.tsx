import type React from 'react'
import type { ErrorInfo } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { I18nextProvider } from 'react-i18next'
import type { QueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { ComponentsProvider } from '../ComponentAdapter/ComponentsProvider'
import type { ComponentsContextType } from '../ComponentAdapter/useComponentContext'
import { ApiProvider } from '../ApiProvider/ApiProvider'
import { LoadingIndicatorProvider } from '../LoadingIndicatorProvider/LoadingIndicatorProvider'
import type { LoadingIndicatorContextProps } from '../LoadingIndicatorProvider/useLoadingIndicator'
import { ObservabilityProvider } from '../ObservabilityProvider'
import { sanitizeError } from '../ObservabilityProvider/sanitization'
import { SDKI18next } from './SDKI18next'
import { InternalError } from '@/components/Common'
import { LocaleProvider } from '@/contexts/LocaleProvider'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import type { GustoSDKTheme } from '@/contexts/ThemeProvider/theme'
import type { ResourceDictionary, SupportedLanguages } from '@/types/Helpers'
import type { SDKHooks } from '@/types/hooks'
import type { ObservabilityHook } from '@/types/observability'
import { normalizeToSDKError } from '@/types/sdkError'

export interface APIConfig {
  baseUrl: string
  headers?: HeadersInit
  hooks?: SDKHooks
  observability?: ObservabilityHook
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
    queryClient,
  } = props

  if (dictionary) {
    for (const language in dictionary) {
      const lang = language as SupportedLanguages
      for (const ns in dictionary[lang]) {
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

  useEffect(() => {
    void (async () => {
      await SDKI18next.changeLanguage(lng)
    })()
  }, [lng])

  const handleTopLevelError = useMemo(() => {
    if (!config.observability?.onError) return undefined

    return (error: unknown, errorInfo: ErrorInfo) => {
      if (!config.observability?.onError) return

      const sdkError = normalizeToSDKError(error)

      const observabilityError = {
        ...sdkError,
        timestamp: Date.now(),
        componentStack: errorInfo.componentStack ?? undefined,
      }

      const sanitizedError = sanitizeError(observabilityError, config.observability.sanitization)

      config.observability.onError(sanitizedError)
    }
  }, [config.observability])
  return (
    <ComponentsProvider value={components}>
      <LoadingIndicatorProvider value={LoaderComponent}>
        <ObservabilityProvider observability={config.observability}>
          <ErrorBoundary FallbackComponent={InternalError} onError={handleTopLevelError}>
            <ThemeProvider theme={theme}>
              <LocaleProvider locale={locale} currency={currency}>
                <I18nextProvider i18n={SDKI18next} key={lng}>
                  <ApiProvider
                    url={config.baseUrl}
                    headers={config.headers}
                    hooks={config.hooks}
                    queryClient={queryClient}
                  >
                    {children}
                  </ApiProvider>
                </I18nextProvider>
              </LocaleProvider>
            </ThemeProvider>
          </ErrorBoundary>
        </ObservabilityProvider>
      </LoadingIndicatorProvider>
    </ComponentsProvider>
  )
}

export { GustoProviderCustomUIAdapter }
