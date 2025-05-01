import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { List } from './List'

describe('List Component', () => {
  it('renders an unordered list by default', () => {
    render(<List items={['Item 1', 'Item 2', 'Item 3']} />)

    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()
    expect(list.tagName).toBe('UL')

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveTextContent('Item 1')
    expect(items[1]).toHaveTextContent('Item 2')
    expect(items[2]).toHaveTextContent('Item 3')
  })

  it('renders an ordered list when variant is "ordered"', () => {
    render(<List variant="ordered" items={['Item 1', 'Item 2', 'Item 3']} />)

    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()
    expect(list.tagName).toBe('OL')

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
  })

  it('applies custom className to the list', () => {
    render(<List className="custom-list" items={['Item 1', 'Item 2']} />)

    const list = screen.getByRole('list')
    expect(list).toHaveClass('custom-list')
  })

  it('supports data-variant attribute', () => {
    render(<List variant="ordered" items={['Item 1', 'Item 2']} />)

    const list = screen.getByRole('list')
    expect(list).toHaveAttribute('data-variant', 'ordered')
  })

  it('supports accessibility attributes', () => {
    render(
      <List
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

    render(<List items={complexItems} />)

    expect(screen.getByTestId('complex-1')).toBeInTheDocument()
    expect(screen.getByTestId('complex-2')).toBeInTheDocument()
  })
})
