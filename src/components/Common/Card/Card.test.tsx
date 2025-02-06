import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import { Card } from '@/components/Common/Card/Card'

describe('Card Component', () => {
  test('renders children correctly', () => {
    render(<Card>Test Content</Card>)

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  test('renders menu when provided', () => {
    render(<Card menu={<div>Menu Content</div>}>Test Content</Card>)

    expect(screen.getByText('Menu Content')).toBeInTheDocument()
  })

  test('does not render menu when not provided', () => {
    render(<Card>Test Content</Card>)

    expect(screen.queryByText('Menu Content')).not.toBeInTheDocument()
  })

  test('calls onSelect when checkbox is clicked', async () => {
    const onSelectMock = vi.fn()
    render(<Card onSelect={onSelectMock}>Test Content</Card>)

    const checkbox = screen.getByRole('checkbox', { name: 'select' })
    await userEvent.click(checkbox)

    expect(onSelectMock).toHaveBeenCalledTimes(1)
  })

  test('does not render checkbox if onSelect is not provided', () => {
    render(<Card>Test Content</Card>)

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })
})
