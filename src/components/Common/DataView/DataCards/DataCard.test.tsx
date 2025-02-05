import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import { DataCard } from '@/components/Common/DataView/DataCards/DataCard'

describe('DataCard Component', () => {
  test('renders children correctly', () => {
    render(<DataCard>Test Content</DataCard>)

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  test('renders menu when provided', () => {
    render(<DataCard menu={<div>Menu Content</div>}>Test Content</DataCard>)

    expect(screen.getByText('Menu Content')).toBeInTheDocument()
  })

  test('does not render menu when not provided', () => {
    render(<DataCard>Test Content</DataCard>)

    expect(screen.queryByText('Menu Content')).not.toBeInTheDocument()
  })

  test('calls onSelect when checkbox is clicked', async () => {
    const onSelectMock = vi.fn()
    render(<DataCard onSelect={onSelectMock}>Test Content</DataCard>)

    const checkbox = screen.getByRole('checkbox', { name: 'select' })
    await userEvent.click(checkbox)

    expect(onSelectMock).toHaveBeenCalledTimes(1)
  })

  test('does not render checkbox if onSelect is not provided', () => {
    render(<DataCard>Test Content</DataCard>)

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })
})
