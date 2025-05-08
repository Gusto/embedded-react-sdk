import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { OrderedList } from './OrderedList'

describe('OrderedList Component', () => {
  it('renders an ordered list', () => {
    render(<OrderedList items={['Item 1', 'Item 2', 'Item 3']} />)

    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()
    expect(list.tagName).toBe('OL')

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveTextContent('Item 1')
    expect(items[1]).toHaveTextContent('Item 2')
    expect(items[2]).toHaveTextContent('Item 3')
  })

  it('applies custom className to the ordered list', () => {
    render(<OrderedList className="custom-list" items={['Item 1', 'Item 2']} />)

    const list = screen.getByRole('list')
    expect(list).toHaveClass('custom-list')
  })

  it('supports data-variant attribute', () => {
    render(<OrderedList items={['Item 1', 'Item 2']} />)

    const list = screen.getByRole('list')
    expect(list).toHaveAttribute('data-variant', 'ordered')
  })

  it('supports accessibility attributes', () => {
    render(
      <OrderedList
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
})
