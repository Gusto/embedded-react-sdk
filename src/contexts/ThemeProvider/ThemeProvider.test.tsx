import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import { ThemeProvider } from './ThemeProvider'

// Initialize i18next for testing
const i18n = i18next.createInstance()
void i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: { en: { common: {} } },
  interpolation: { escapeValue: false },
})

describe('<ThemeProvider />', () => {
  test('Wraps child element in .GSDK section', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <p>Child</p>
        </ThemeProvider>
      </I18nextProvider>,
    )
    const GSDK = screen.getByTestId('GSDK')

    expect(GSDK).toBeInTheDocument()
    expect(GSDK).toHaveClass('GSDK')
  })
})
