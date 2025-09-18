import { I18nextProvider } from 'react-i18next'
import { SDKI18next } from '@/contexts/GustoProvider/SDKI18next'
import { LocaleProvider } from '@/contexts/LocaleProvider'
import { ThemeProvider } from '@/contexts/ThemeProvider'

interface I18nWrapperProps {
  children: React.ReactNode
}

export const I18nWrapper = ({ children }: I18nWrapperProps) => {
  return (
    <I18nextProvider i18n={SDKI18next}>
      <LocaleProvider locale="en-US" currency="USD">
        <ThemeProvider>{children}</ThemeProvider>
      </LocaleProvider>
    </I18nextProvider>
  )
}
