import { screen } from '@testing-library/react'
import { describe, test, expect, it } from 'vitest'
import { Container } from './Container'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Container Component', () => {
  test('renders children correctly', () => {
    renderWithProviders(<Container>Test Content</Container>)

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  test('applies custom className', () => {
    renderWithProviders(<Container className="custom-style">Test Content</Container>)

    expect(screen.getByTestId('data-container')).toHaveClass('custom-style')
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic container',
        props: { children: 'Basic container content' },
      },
      {
        name: 'container with custom className',
        props: { className: 'custom-style', children: 'Styled container' },
      },
      {
        name: 'container with complex content',
        props: {
          children: (
            <div>
              <h3>Container Title</h3>
              <p>Container description with multiple elements.</p>
              <button>Action Button</button>
            </div>
          ),
        },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<Container {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })
})
