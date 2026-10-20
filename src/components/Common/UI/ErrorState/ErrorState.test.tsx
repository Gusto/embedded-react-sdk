import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ErrorState } from './ErrorState'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('ErrorState', () => {
  it('renders the title and description as an alert', () => {
    renderWithProviders(
      <ErrorState title="This payroll has changed" description="Return to your payrolls." />,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'This payroll has changed' })).toBeInTheDocument()
    expect(screen.getByText('Return to your payrolls.')).toBeInTheDocument()
  })

  it('renders the action and calls onClick when pressed', async () => {
    const onClick = vi.fn()
    renderWithProviders(
      <ErrorState title="Something changed" action={{ label: 'Back to payrolls', onClick }} />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Back to payrolls' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders no button when no action is provided', () => {
    renderWithProviders(<ErrorState title="Something changed" />)

    expect(screen.queryByRole('button')).toBeNull()
  })
})
