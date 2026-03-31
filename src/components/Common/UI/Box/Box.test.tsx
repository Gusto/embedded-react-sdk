import { screen } from '@testing-library/react'
import { describe, test, expect, it } from 'vitest'
import { Box } from './Box'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Box Component', () => {
  test('renders content correctly', () => {
    renderWithProviders(
      <Box>
        <Box.Content>Test Content</Box.Content>
      </Box>,
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  test('renders header when provided', () => {
    renderWithProviders(
      <Box>
        <Box.Header>Header Text</Box.Header>
        <Box.Content>Content</Box.Content>
      </Box>,
    )

    expect(screen.getByText('Header Text')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  test('renders footer when provided', () => {
    renderWithProviders(
      <Box>
        <Box.Content>Content</Box.Content>
        <Box.Footer>
          <button>Save</button>
        </Box.Footer>
      </Box>,
    )

    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  test('renders all sections together', () => {
    renderWithProviders(
      <Box>
        <Box.Header>Header</Box.Header>
        <Box.Content>Content</Box.Content>
        <Box.Footer>Footer</Box.Footer>
      </Box>,
    )

    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  test('renders flush content variant', () => {
    renderWithProviders(
      <Box>
        <Box.Content variant="flush">Flush Content</Box.Content>
      </Box>,
    )

    expect(screen.getByText('Flush Content')).toBeInTheDocument()
  })

  test('renders default and flush content with different classes', () => {
    renderWithProviders(
      <Box>
        <Box.Content>Default Content</Box.Content>
        <Box.Content variant="flush">Flush Content</Box.Content>
      </Box>,
    )

    const defaultWrapper = screen.getByText('Default Content').closest('div')!
    const flushWrapper = screen.getByText('Flush Content').closest('div')!
    expect(defaultWrapper.className).not.toBe(flushWrapper.className)
  })

  test('applies custom className', () => {
    renderWithProviders(
      <Box className="custom-style">
        <Box.Content>Test Content</Box.Content>
      </Box>,
    )

    expect(screen.getByTestId('data-box')).toHaveClass('custom-style')
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'box with content',
        element: (
          <Box>
            <Box.Content>Basic box content</Box.Content>
          </Box>
        ),
      },
      {
        name: 'box with custom className',
        element: (
          <Box className="custom-style">
            <Box.Content>Styled box</Box.Content>
          </Box>
        ),
      },
      {
        name: 'box with complex content',
        element: (
          <Box>
            <Box.Header>
              <h3>Box Title</h3>
            </Box.Header>
            <Box.Content>
              <p>Box description with multiple elements.</p>
              <button>Action Button</button>
            </Box.Content>
          </Box>
        ),
      },
      {
        name: 'box with all sections',
        element: (
          <Box>
            <Box.Header>Header</Box.Header>
            <Box.Content>Main content</Box.Content>
            <Box.Footer>
              <button>Save</button>
            </Box.Footer>
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
