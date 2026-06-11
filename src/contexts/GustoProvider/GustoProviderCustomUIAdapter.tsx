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
import { ReadOnlyProvider } from '../ReadOnlyProvider/ReadOnlyProvider'
import { SDKI18next } from './SDKI18next'
import { InternalError } from '@/components/Common'
import { LocaleProvider } from '@/contexts/LocaleProvider'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import type { GustoSDKTheme } from '@/contexts/ThemeProvider/theme'
import type { ResourceDictionary, SupportedLanguages } from '@/types/Helpers'
import type { SDKHooks } from '@/types/hooks'
import type { ObservabilityHook } from '@/types/observability'
import { normalizeToSDKError } from '@/types/sdkError'

/**
 * API client configuration passed to {@link GustoProvider} (and {@link GustoProviderCustomUIAdapter}).
 *
 * @public
 */
export interface APIConfig {
  /** URL of your backend proxy that forwards SDK requests to the Gusto Embedded API. SDK components never call Gusto directly. */
  baseUrl: string
  /** Extra headers applied to every API request. Combined with any headers your proxy adds. */
  headers?: HeadersInit
  /** Request interceptor hooks. Use these to inspect, modify, or react to requests and responses. See {@link SDKHooks}. */
  hooks?: SDKHooks
  /** Observability hook for surfacing errors and metrics from the SDK to your monitoring stack. See {@link ObservabilityHook}. */
  observability?: ObservabilityHook
}

/**
 * Shared configuration props accepted by {@link GustoProvider} and {@link GustoProviderCustomUIAdapter}.
 *
 * @public
 */
export interface GustoProviderProps {
  /** API client configuration, including the proxy `baseUrl`, request hooks, and observability. See {@link APIConfig}. */
  config: APIConfig
  /** Translation overrides keyed by language and i18next namespace. Strings supplied here replace the SDK defaults for the matching keys. */
  dictionary?: ResourceDictionary
  /** Active i18next language. Defaults to `'en'`. */
  lng?: string
  /** BCP 47 locale used for number, date, and currency formatting throughout the SDK. Defaults to `'en-US'`. */
  locale?: string
  /** ISO 4217 currency code used for monetary formatting. Defaults to `'USD'`. */
  currency?: string
  /** Theme overrides applied to SDK components. See {@link GustoSDKTheme}. */
  theme?: Partial<GustoSDKTheme>
  /** Element to use as the portal container for SDK popovers and dropdowns. Useful when rendering inside a modal or shadow root. */
  portalContainer?: HTMLElement
  /** Optional TanStack Query `QueryClient`. When omitted, the SDK creates its own client configured for Gusto's API. */
  queryClient?: QueryClient
  /** When true, SDK components suppress write actions and SDK API requests using mutating HTTP methods are blocked. */
  readOnly?: boolean
  /** Complete map of UI components the SDK renders. Required because this adapter ships no defaults. */
  components: ComponentsContextType
  /** Loading indicator rendered while SDK queries are pending. Overrides the SDK default spinner. */
  LoaderComponent?: LoadingIndicatorContextProps['LoadingIndicator']
}

/**
 * Props for {@link GustoProviderCustomUIAdapter}.
 *
 * @public
 */
export interface GustoProviderCustomUIAdapterProps extends GustoProviderProps {
  /** The application tree that should have access to the SDK. */
  children?: React.ReactNode
}

/**
 * Top-level provider that requires a complete component map and ships no UI defaults.
 *
 * @remarks
 * Use this adapter when you want full control over every UI primitive the SDK renders, or when
 * you want to avoid the React Aria dependency for tree-shaking. Unlike {@link GustoProvider}, the
 * `components` prop on {@link GustoProviderProps} is required and must supply every component the
 * SDK renders.
 *
 * @param props - See {@link GustoProviderCustomUIAdapterProps}.
 * @returns The configured provider tree wrapping `children`.
 * @public
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
    portalContainer,
    components,
    LoaderComponent,
    queryClient,
    readOnly = false,
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
          <ReadOnlyProvider readOnly={readOnly}>
            <ErrorBoundary FallbackComponent={InternalError} onError={handleTopLevelError}>
              <ThemeProvider theme={theme} portalContainer={portalContainer}>
                <LocaleProvider locale={locale} currency={currency}>
                  <I18nextProvider i18n={SDKI18next} key={lng}>
                    <ApiProvider
                      url={config.baseUrl}
                      headers={config.headers}
                      hooks={config.hooks}
                      queryClient={queryClient}
                      readOnly={readOnly}
                    >
                      {children}
                    </ApiProvider>
                  </I18nextProvider>
                </LocaleProvider>
              </ThemeProvider>
            </ErrorBoundary>
          </ReadOnlyProvider>
        </ObservabilityProvider>
      </LoadingIndicatorProvider>
    </ComponentsProvider>
  )
}

export { GustoProviderCustomUIAdapter }
