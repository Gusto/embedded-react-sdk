import { render, RenderOptions } from '@testing-library/react'
import React, { ReactElement } from 'react'
import { I18nextProvider, useTranslation } from 'react-i18next'
import { defaultTheme } from './DefaultTheme'
import { ThemeProvider } from './ThemeProvider'
import '@/i18n'
import '@testing-library/jest-dom'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation()
  return (
    <ThemeProvider theme={defaultTheme}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </ThemeProvider>
  )
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
