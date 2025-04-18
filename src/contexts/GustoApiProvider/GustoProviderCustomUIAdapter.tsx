import type React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { I18nextProvider } from 'react-i18next'
import { ReactSDKProvider } from '@gusto/embedded-api/ReactSDKProvider'
import { ComponentsProvider } from '../ComponentAdapter/ComponentsProvider'
import type { ComponentsContextType } from '../ComponentAdapter/ComponentsProvider'
import { SDKI18next } from './SDKI18next'
import { useGustoProvider, type GustoProviderProps } from './useGustoProvider'
import { InternalError } from '@/components/Common'
import { LocaleProvider } from '@/contexts/LocaleProvider'
import { ThemeProvider } from '@/contexts/ThemeProvider'

export interface GustoProviderCustomUIAdapterProps extends GustoProviderProps {
  children?: React.ReactNode
}

/**
 * A provider that accepts UI component adapters through the components prop
 */
const GustoProviderCustomUIAdapter: React.FC<GustoProviderCustomUIAdapterProps> = props => {
  const { children, ...providerProps } = props
  const { config, lng, locale, currency, theme, components } = useGustoProvider(providerProps)

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
