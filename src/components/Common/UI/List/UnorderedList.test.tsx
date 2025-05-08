import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { UnorderedList } from './UnorderedList'

describe('UnorderedList Component', () => {
  it('renders an unordered list', () => {
    render(<UnorderedList items={['Item 1', 'Item 2', 'Item 3']} />)

    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()
    expect(list.tagName).toBe('UL')

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveTextContent('Item 1')
    expect(items[1]).toHaveTextContent('Item 2')
    expect(items[2]).toHaveTextContent('Item 3')
  })

  it('applies custom className to the unordered list', () => {
    render(<UnorderedList className="custom-list" items={['Item 1', 'Item 2']} />)

    const list = screen.getByRole('list')
    expect(list).toHaveClass('custom-list')
  })

  it('supports data-variant attribute', () => {
    render(<UnorderedList items={['Item 1', 'Item 2']} />)

    const list = screen.getByRole('list')
    expect(list).toHaveAttribute('data-variant', 'unordered')
  })

  it('supports accessibility attributes', () => {
    render(
      <UnorderedList
        aria-label="Test list"
        aria-labelledby="test-label"
        aria-describedby="test-desc"
        items={['Item 1', 'Item 2']}
      />,
    )

    const list = screen.getByRole('list')
    expect(list).toHaveAttribute('aria-label', 'Test list')
    expect(list).toHaveAttribute('aria-labelledby', 'test-label')
    expect(list).toHaveAttribute('aria-describedby', 'test-desc')
  })

  it('renders complex React node items', () => {
    const complexItems = [
      <span key="1" data-testid="complex-1">
        Complex Item 1
      </span>,
      <div key="2" data-testid="complex-2">
        Complex Item 2
      </div>,
    ]

    render(<UnorderedList items={complexItems} />)

    expect(screen.getByTestId('complex-1')).toBeInTheDocument()
    expect(screen.getByTestId('complex-2')).toBeInTheDocument()
  })
})
