import i18next, { type i18n, CustomTypeOptions } from 'i18next'
import React, { useEffect, useMemo } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { InternalError } from '@/components/Common'
import { LocaleProvider } from '@/contexts/LocaleProvider'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { defaultNS } from '@/i18n'
import commonEn from '@/i18n/en/common.json'
import { GTheme } from '@/types/GTheme'
import { APIConfig, GustoClient } from '@/api/client'
import { GustoApiContextProvider } from '@/api/context'

type Resources = CustomTypeOptions['resources']

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends object
      ? DeepPartial<T[P]>
      : T[P]
}
export type Dictionary = Record<
  string,
  Partial<{ [K in keyof Resources]: DeepPartial<Resources[K]> }>
>

export interface GustoApiProps {
  config?: APIConfig
  dictionary?: Dictionary
  lng?: string
  locale?: string
  currency?: string
  theme?: GTheme
  children?: React.ReactNode
}

/**Creating new i18next instance to avoid global clashing */
const SDKI18next: i18n = i18next.createInstance({
  debug: false,
  fallbackLng: 'en',
  resources: {
    en: { common: commonEn },
  },
  defaultNS,
})

// SDKI18next.use is not a hook, even though it is called with 'use'
// eslint-disable-next-line react-hooks/rules-of-hooks
await SDKI18next.use(initReactI18next).init()

const GustoApiProvider: React.FC<GustoApiProps> = ({
  config,
  dictionary,
  lng = 'en',
  locale = 'en-US',
  currency = 'USD',
  theme,
  children,
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
            <GustoApiContextProvider context={context}>{children}</GustoApiContextProvider>
          </I18nextProvider>
        </ThemeProvider>
      </LocaleProvider>
    </ErrorBoundary>
  )
}

export { GustoApiProvider, SDKI18next }
