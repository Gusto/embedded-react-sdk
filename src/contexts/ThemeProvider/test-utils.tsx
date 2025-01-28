import { render, RenderOptions } from '@testing-library/react'
import React, { ReactElement } from 'react'
import { I18nextProvider, useTranslation } from 'react-i18next'
import { createTheme } from './createTheme'
import { ThemeProvider } from './ThemeProvider'
import '@/i18n'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation()
  const theme = createTheme()
  return (
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </ThemeProvider>
  )
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options })

export { customRender as render }
