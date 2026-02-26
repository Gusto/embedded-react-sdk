import { screen } from '@testing-library/react'
import { describe, test, expect, it } from 'vitest'
import { Box } from './Box'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Box Component', () => {
  test('renders children correctly', () => {
    renderWithProviders(<Box>Test Content</Box>)

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  test('applies custom className', () => {
    renderWithProviders(<Box className="custom-style">Test Content</Box>)

    expect(screen.getByTestId('data-box')).toHaveClass('custom-style')
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic box',
        props: { children: 'Basic box content' },
      },
      {
        name: 'box with custom className',
        props: { className: 'custom-style', children: 'Styled box' },
      },
      {
        name: 'box with complex content',
        props: {
          children: (
            <div>
              <h3>Box Title</h3>
              <p>Box description with multiple elements.</p>
              <button>Action Button</button>
            </div>
          ),
        },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<Box {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })
})
