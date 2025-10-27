import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { List } from './List'

describe('List', () => {
  it('renders a ul element', () => {
    render(<List items={['Item 1', 'Item 2']} />)
    const list = screen.getByRole('list')
    expect(list.tagName).toBe('UL')
  })

  it('renders list items', () => {
    const items = ['First item', 'Second item', 'Third item']
    render(<List items={items} />)

    items.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument()
    })
  })

  it('renders the correct number of list items', () => {
    const items = ['Item 1', 'Item 2', 'Item 3']
    render(<List items={items} />)

    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(3)
  })

  it('applies custom className', () => {
    render(<List items={['Item 1']} className="custom-class" />)
    const list = screen.getByRole('list')
    expect(list).toHaveClass('custom-class')
  })

  it('supports aria-label', () => {
    render(<List items={['Item 1']} aria-label="Test list" />)
    const list = screen.getByRole('list', { name: 'Test list' })
    expect(list).toBeInTheDocument()
  })

  it('supports aria-labelledby', () => {
    render(
      <div>
        <h2 id="list-title">My List</h2>
        <List items={['Item 1']} aria-labelledby="list-title" />
      </div>,
    )
    const list = screen.getByRole('list')
    expect(list).toHaveAttribute('aria-labelledby', 'list-title')
  })

  it('supports aria-describedby', () => {
    render(
      <div>
        <p id="list-description">This is a description</p>
        <List items={['Item 1']} aria-describedby="list-description" />
      </div>,
    )
    const list = screen.getByRole('list')
    expect(list).toHaveAttribute('aria-describedby', 'list-description')
  })

  it('renders React node items', () => {
    const items = [
      <span key="1">
        Item with <strong>bold</strong>
      </span>,
      <span key="2">
        Item with <em>italic</em>
      </span>,
    ]
    render(<List items={items} />)

    expect(screen.getByText('bold')).toBeInTheDocument()
    expect(screen.getByText('italic')).toBeInTheDocument()
  })

  it('handles empty items array', () => {
    render(<List items={[]} />)
    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()

    const listItems = screen.queryAllByRole('listitem')
    expect(listItems).toHaveLength(0)
  })
})
