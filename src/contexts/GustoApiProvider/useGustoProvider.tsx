import { useEffect } from 'react'
import type { CustomTypeOptions } from 'i18next'
import type { QueryClient } from '@tanstack/react-query'
import type { ComponentsContextType } from '../ComponentAdapter/ComponentsProvider'
import { SDKI18next } from './SDKI18next'
import type { GTheme } from '@/types/GTheme'
import type { DeepPartial } from '@/types/Helpers'

interface APIConfig {
  baseUrl: string
  headers?: Record<string, string | number>
}

type Resources = CustomTypeOptions['resources']

export type Dictionary = Record<
  string,
  Partial<{ [K in keyof Resources]: DeepPartial<Resources[K]> }>
>

export interface GustoProviderProps {
  config: APIConfig
  dictionary?: Dictionary
  lng?: string
  locale?: string
  currency?: string
  theme?: DeepPartial<GTheme>
  queryClient?: QueryClient
  components?: Partial<ComponentsContextType>
}

export const useGustoProvider = ({
  config,
  dictionary,
  lng = 'en',
  locale = 'en-US',
  currency = 'USD',
  theme,
  queryClient,
  components,
}: GustoProviderProps) => {
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

  return {
    config,
    lng,
    locale,
    currency,
    theme,
    components,
  }
}
