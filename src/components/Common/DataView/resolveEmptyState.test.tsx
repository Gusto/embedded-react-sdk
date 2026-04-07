import { describe, test, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { resolveEmptyState } from './resolveEmptyState'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('resolveEmptyState', () => {
  test('returns undefined when input is undefined', () => {
    expect(resolveEmptyState(undefined)).toBeUndefined()
  })

  test('returns the function as-is when input is a function', () => {
    const fn = () => <div>Custom empty state</div>
    expect(resolveEmptyState(fn)).toBe(fn)
  })

  test('renders EmptyData with title and description from config', () => {
    const resolved = resolveEmptyState({
      title: 'No items',
      description: 'Add items to get started',
    })
    expect(resolved).toBeDefined()
    renderWithProviders(<>{resolved!()}</>)
    expect(screen.getByText('No items')).toBeInTheDocument()
    expect(screen.getByText('Add items to get started')).toBeInTheDocument()
  })

  test('renders EmptyData with title only when description is omitted', () => {
    const resolved = resolveEmptyState({ title: 'No items' })
    expect(resolved).toBeDefined()
    renderWithProviders(<>{resolved!()}</>)
    expect(screen.getByText('No items')).toBeInTheDocument()
  })

  test('renders action button when action is provided', async () => {
    const onClick = vi.fn()
    const resolved = resolveEmptyState({
      title: 'No items',
      description: 'Add items to get started',
      action: { label: 'Add item', onClick },
    })
    expect(resolved).toBeDefined()
    renderWithProviders(<>{resolved!()}</>)
    const button = screen.getByRole('button', { name: 'Add item' })
    expect(button).toBeInTheDocument()
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })
})
