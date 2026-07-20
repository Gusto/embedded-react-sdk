import { screen } from '@testing-library/react'
import { describe, test, expect, it } from 'vitest'
import { FormBox } from './FormBox'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('FormBox Component', () => {
  test('renders content correctly', () => {
    renderWithProviders(<FormBox>Test Content</FormBox>)

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  test('renders header when provided', () => {
    renderWithProviders(<FormBox header="Header Text">Content</FormBox>)

    expect(screen.getByText('Header Text')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  test('renders header and content together', () => {
    renderWithProviders(<FormBox header="Header">Content</FormBox>)

    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  test('renders flush content variant', () => {
    renderWithProviders(<FormBox withPadding={false}>Flush Content</FormBox>)

    expect(screen.getByText('Flush Content')).toBeInTheDocument()
  })

  test('renders default and flush content with different classes', () => {
    const { rerender } = renderWithProviders(<FormBox>Default Content</FormBox>)
    const defaultWrapper = screen.getByText('Default Content').closest('div')!
    const defaultClassName = defaultWrapper.className

    rerender(<FormBox withPadding={false}>Flush Content</FormBox>)
    const flushWrapper = screen.getByText('Flush Content').closest('div')!
    expect(defaultClassName).not.toBe(flushWrapper.className)
  })

  test('applies custom className', () => {
    renderWithProviders(<FormBox className="custom-style">Test Content</FormBox>)

    expect(screen.getByTestId('data-form-box')).toHaveClass('custom-style')
  })

  test('does not render header section when header is not provided', () => {
    renderWithProviders(<FormBox>Content</FormBox>)

    const box = screen.getByTestId('data-form-box')
    expect(box.children).toHaveLength(1)
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'form box with content',
        element: <FormBox>Basic form box content</FormBox>,
      },
      {
        name: 'form box with custom className',
        element: <FormBox className="custom-style">Styled form box</FormBox>,
      },
      {
        name: 'form box with complex content',
        element: (
          <FormBox header={<h3>Form Box Title</h3>}>
            <p>Form box description with multiple elements.</p>
            <button type="button">Action Button</button>
          </FormBox>
        ),
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ element }) => {
        const { container } = renderWithProviders(element)
        await expectNoAxeViolations(container)
      },
    )
  })
})
