import { screen } from '@testing-library/react'
import { describe, test, expect, it } from 'vitest'
import { Box } from './Box'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Box Component', () => {
  test('renders content correctly', () => {
    renderWithProviders(<Box>Test Content</Box>)

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  test('renders header when provided', () => {
    renderWithProviders(<Box header="Header Text">Content</Box>)

    expect(screen.getByText('Header Text')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  test('renders footer when provided', () => {
    renderWithProviders(<Box footer={<button type="button">Save</button>}>Content</Box>)

    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  test('renders all sections together', () => {
    renderWithProviders(
      <Box header="Header" footer="Footer">
        Content
      </Box>,
    )

    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  test('renders flush content variant', () => {
    renderWithProviders(<Box flush>Flush Content</Box>)

    expect(screen.getByText('Flush Content')).toBeInTheDocument()
  })

  test('renders default and flush content with different classes', () => {
    const { rerender } = renderWithProviders(<Box>Default Content</Box>)
    const defaultWrapper = screen.getByText('Default Content').closest('div')!
    const defaultClassName = defaultWrapper.className

    rerender(<Box flush>Flush Content</Box>)
    const flushWrapper = screen.getByText('Flush Content').closest('div')!
    expect(defaultClassName).not.toBe(flushWrapper.className)
  })

  test('applies custom className', () => {
    renderWithProviders(<Box className="custom-style">Test Content</Box>)

    expect(screen.getByTestId('data-box')).toHaveClass('custom-style')
  })

  test('does not render header section when header is not provided', () => {
    renderWithProviders(<Box>Content</Box>)

    const box = screen.getByTestId('data-box')
    expect(box.children).toHaveLength(1)
  })

  test('does not render footer section when footer is not provided', () => {
    renderWithProviders(<Box>Content</Box>)

    const box = screen.getByTestId('data-box')
    expect(box.children).toHaveLength(1)
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'box with content',
        element: <Box>Basic box content</Box>,
      },
      {
        name: 'box with custom className',
        element: <Box className="custom-style">Styled box</Box>,
      },
      {
        name: 'box with complex content',
        element: (
          <Box header={<h3>Box Title</h3>}>
            <p>Box description with multiple elements.</p>
            <button type="button">Action Button</button>
          </Box>
        ),
      },
      {
        name: 'box with all sections',
        element: (
          <Box header="Header" footer={<button type="button">Save</button>}>
            Main content
          </Box>
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
