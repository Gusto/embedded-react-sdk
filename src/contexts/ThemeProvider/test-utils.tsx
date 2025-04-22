import type React from 'react'
import { I18nextProvider, useTranslation } from 'react-i18next'
import { createTheme } from './createTheme'
import { ThemeProvider } from './ThemeProvider'
import '@/i18n'

export const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation()
  const theme = createTheme()
  return (
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </ThemeProvider>
  )
}
