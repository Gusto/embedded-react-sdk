import { type CustomTypeOptions } from 'i18next'
import React, { useEffect, useMemo } from 'react'
import { QueryClient } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { I18nextProvider } from 'react-i18next'
import { ReactSDKProvider } from '@gusto/embedded-api/ReactSDKProvider'
import { SDKI18next } from './SDKI18next'
import { InternalError } from '@/components/Common'
import { LocaleProvider } from '@/contexts/LocaleProvider'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { GTheme } from '@/types/GTheme'
import { APIConfig, GustoClient } from '@/api/client'
import { GustoApiContextProvider } from '@/api/context'
import { DeepPartial } from '@/types/Helpers'

type Resources = CustomTypeOptions['resources']

export type Dictionary = Record<
  string,
  Partial<{ [K in keyof Resources]: DeepPartial<Resources[K]> }>
>

export interface GustoApiProps {
  config: APIConfig
  dictionary?: Dictionary
  lng?: string
  locale?: string
  currency?: string
  theme?: DeepPartial<GTheme>
  children?: React.ReactNode
  queryClient?: QueryClient
}

const GustoApiProvider: React.FC<GustoApiProps> = ({
  config,
  dictionary,
  lng = 'en',
  locale = 'en-US',
  currency = 'USD',
  theme,
  children,
  queryClient,
}) => {
  const context = useMemo(() => ({ GustoClient: new GustoClient(config) }), [config])

  if (dictionary) {
    for (const language in dictionary) {
      for (const ns in dictionary[language]) {
        //Adding resources overrides to i18next instance - initial load will override common namespace and add component specific dictionaries provided by partners
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
  useEffect(() => {
    void (async () => {
      await SDKI18next.changeLanguage(lng)
    })()
  }, [lng])

  return (
    <ErrorBoundary FallbackComponent={InternalError}>
      <LocaleProvider locale={locale} currency={currency}>
        <ThemeProvider theme={theme}>
          <I18nextProvider i18n={SDKI18next} key={lng}>
            <GustoApiContextProvider context={context} queryClient={queryClient}>
              <ReactSDKProvider url={config.baseUrl}>{children}</ReactSDKProvider>
            </GustoApiContextProvider>
          </I18nextProvider>
        </ThemeProvider>
      </LocaleProvider>
    </ErrorBoundary>
  )
}

export { GustoApiProvider }
