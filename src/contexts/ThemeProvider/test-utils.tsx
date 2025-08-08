import type React from 'react'
import { I18nextProvider, useTranslation } from 'react-i18next'
import { ThemeProvider } from './ThemeProvider'
import { gustoSDKTheme } from './theme'
import '@/i18n'

export const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation()
  const theme = gustoSDKTheme
  return (
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </ThemeProvider>
  )
}
