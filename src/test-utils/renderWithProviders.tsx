import type { ReactElement } from 'react'
import type React from 'react'
import type { RenderOptions } from '@testing-library/react'
import { render } from '@testing-library/react'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

// Initialize i18next for testing
const i18n = i18next.createInstance()
// Silence the promise warning
void i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['common'],
  defaultNS: 'common',
  resources: {
    en: {
      common: {},
    },
  },
  interpolation: {
    escapeValue: false, // not needed for react
  },
})

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  readOnly?: boolean
}

/**
 * Custom render function that wraps the component with necessary providers
 * - ComponentsProvider: Provides UI components
 * - LocaleProvider: Provides locale settings
 * - I18nextProvider: Provides translation functions
 */
export const renderWithProviders = (ui: ReactElement, options?: RenderWithProvidersOptions) => {
  const { readOnly = false, ...renderOptions } = options ?? {}
  const TestProvider = ({ children }: { children: React.ReactNode }) => (
    <GustoTestProvider readOnly={readOnly}>{children}</GustoTestProvider>
  )

  return render(ui, { wrapper: TestProvider, ...renderOptions })
}
