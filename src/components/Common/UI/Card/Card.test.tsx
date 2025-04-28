import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi, beforeAll } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { Card } from './Card'

// Initialize i18n for tests
beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    resources: {
      en: {
        common: {
          'card.selectRowLabel': 'Select row',
        },
      },
    },
  })
})

const renderWithI18n = (ui: React.ReactElement) => {
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>)
}

describe('Card Component', () => {
  test('renders children correctly', () => {
    renderWithI18n(<Card>Test Content</Card>)

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  test('renders menu when provided', () => {
    renderWithI18n(<Card menu={<div>Menu Content</div>}>Test Content</Card>)

    expect(screen.getByText('Menu Content')).toBeInTheDocument()
  })

  test('does not render menu when not provided', () => {
    renderWithI18n(<Card>Test Content</Card>)

    expect(screen.queryByText('Menu Content')).not.toBeInTheDocument()
  })

  test('calls onSelect when checkbox is clicked', async () => {
    const onSelectMock = vi.fn()
    renderWithI18n(<Card onSelect={onSelectMock}>Test Content</Card>)

    const checkbox = screen.getByRole('checkbox')
    await userEvent.click(checkbox)

    expect(onSelectMock).toHaveBeenCalledTimes(1)
  })

  test('does not render checkbox if onSelect is not provided', () => {
    renderWithI18n(<Card>Test Content</Card>)

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })
})
