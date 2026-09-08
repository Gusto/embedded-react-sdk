import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { FieldCaption } from './FieldCaption'
import type { FieldCaptionProps } from './FieldCaptionTypes'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { ComponentsProvider } from '@/contexts/ComponentAdapter/ComponentsProvider'
import { defaultComponents } from '@/contexts/ComponentAdapter/adapters/defaultComponentAdapter'

const renderFieldCaption = (props: FieldCaptionProps) => {
  return render(
    <ThemeProvider>
      <ComponentsProvider value={defaultComponents}>
        <FieldCaption {...props} />
      </ComponentsProvider>
    </ThemeProvider>,
  )
}

describe('FieldCaption', () => {
  test('renders a required indicator when isRequired is true', () => {
    renderFieldCaption({ children: 'Amount', isRequired: true, htmlFor: 'amount' })
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  test('renders no marker at all when isRequired is false', () => {
    renderFieldCaption({ children: 'Amount', isRequired: false, htmlFor: 'amount' })
    expect(screen.queryByText('*')).not.toBeInTheDocument()
    expect(screen.queryByText('(optional)')).not.toBeInTheDocument()
  })

  test('the required indicator is hidden from assistive technology (required is conveyed via aria-required on the input instead)', () => {
    renderFieldCaption({ children: 'Amount', isRequired: true, htmlFor: 'amount' })
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true')
  })

  test('renders as a legend for fieldsets', () => {
    renderFieldCaption({ children: 'Payment method', as: 'legend', isRequired: true })
    const legend = screen.getByText('Payment method', { selector: 'legend' })
    expect(legend).toBeInTheDocument()
  })

  test('renders visually hidden while remaining in the accessibility tree', () => {
    renderFieldCaption({ children: 'Amount', isVisuallyHidden: true, htmlFor: 'amount' })
    expect(screen.getByText('Amount')).toBeInTheDocument()
  })
})

describe('FieldCaption component adapter override', () => {
  test('renders the overridden component when one is provided, instead of the SDK default', () => {
    const CustomFieldCaption = ({ children }: FieldCaptionProps) => (
      <div data-testid="custom-field-caption">{children}</div>
    )

    render(
      <ThemeProvider>
        <ComponentsProvider value={{ ...defaultComponents, FieldCaption: CustomFieldCaption }}>
          <FieldCaption isRequired>Amount</FieldCaption>
        </ComponentsProvider>
      </ThemeProvider>,
    )

    expect(screen.getByTestId('custom-field-caption')).toHaveTextContent('Amount')
    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })
})
