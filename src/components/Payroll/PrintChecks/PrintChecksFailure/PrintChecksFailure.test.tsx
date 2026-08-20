import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PrintChecksFailure } from './PrintChecksFailure'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { printChecksEvents } from '@/shared/constants'

describe('PrintChecksFailure', () => {
  const user = userEvent.setup()

  it('renders the error message', async () => {
    renderWithProviders(
      <PrintChecksFailure
        errorMessage="Cannot generate checks on an unprocessed payroll"
        onEvent={vi.fn()}
      />,
    )

    expect(await screen.findByText("We couldn't generate your checks")).toBeInTheDocument()
    expect(screen.getByText('Cannot generate checks on an unprocessed payroll')).toBeInTheDocument()
  })

  it('fires PRINT_CHECKS_RETRY when the retry button is clicked', async () => {
    const onEvent = vi.fn()
    renderWithProviders(<PrintChecksFailure onEvent={onEvent} />)

    await user.click(await screen.findByRole('button', { name: 'Try again' }))

    expect(onEvent).toHaveBeenCalledWith(printChecksEvents.PRINT_CHECKS_RETRY)
  })

  it('fires PRINT_CHECKS_CLOSE when the Footer close button is clicked', async () => {
    const onEvent = vi.fn()
    renderWithProviders(<PrintChecksFailure.Footer onEvent={onEvent} />)

    await user.click(await screen.findByRole('button', { name: 'Close' }))

    expect(onEvent).toHaveBeenCalledWith(printChecksEvents.PRINT_CHECKS_CLOSE)
  })
})
