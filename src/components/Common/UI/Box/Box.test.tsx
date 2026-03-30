import { screen } from '@testing-library/react'
import { describe, test, expect, it } from 'vitest'
import { Box } from './Box'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Box Component', () => {
  test('renders children correctly', () => {
    renderWithProviders(<Box>Test Content</Box>)

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  test('renders header when provided', () => {
    renderWithProviders(<Box header={<h2>Title</h2>}>Content</Box>)

    expect(screen.getByText('Title')).toBeInTheDocument()
  })

  test('does not render header when omitted', () => {
    renderWithProviders(<Box>Content</Box>)

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  test('renders footer when provided', () => {
    renderWithProviders(<Box footer={<button>Save</button>}>Content</Box>)

    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  test('does not render footer when omitted', () => {
    renderWithProviders(<Box>Content</Box>)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
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
      {
        name: 'box with header',
        props: {
          children: 'Main content',
          header: <h2>Title</h2>,
        },
      },
      {
        name: 'box with footer',
        props: {
          children: 'Main content',
          footer: <button>Save</button>,
        },
      },
      {
        name: 'box with header and footer',
        props: {
          children: 'Main content',
          header: <h2>Title</h2>,
          footer: <button>Save</button>,
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
