import { I18nextProvider, useTranslation } from 'react-i18next'
import { defaultTheme } from "./DefaultTheme"
import { ThemeProvider } from './ThemeProvider'

export const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation()
  return (
    <ThemeProvider theme={defaultTheme}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </ThemeProvider>
  )
}
