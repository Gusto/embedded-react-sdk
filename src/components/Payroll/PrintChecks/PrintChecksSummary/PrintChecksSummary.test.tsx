import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PrintChecksSummary } from './PrintChecksSummary'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { printChecksEvents } from '@/shared/constants'

describe('PrintChecksSummary', () => {
  const user = userEvent.setup()

  it('renders a link to the document when a documentUrl is provided', async () => {
    renderWithProviders(
      <PrintChecksSummary documentUrl="https://example.com/checks.pdf" onEvent={vi.fn()} />,
    )

    expect(await screen.findByText('Your checks are ready')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View checks' })).toHaveAttribute(
      'href',
      'https://example.com/checks.pdf',
    )
  })

  it('omits the link when no documentUrl is provided', async () => {
    renderWithProviders(<PrintChecksSummary onEvent={vi.fn()} />)

    expect(await screen.findByText('Your checks are ready')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'View checks' })).toBeNull()
  })

  it('fires PRINT_CHECKS_CLOSE when the Footer close button is clicked', async () => {
    const onEvent = vi.fn()
    renderWithProviders(<PrintChecksSummary.Footer onEvent={onEvent} />)

    await user.click(await screen.findByRole('button', { name: 'Close' }))

    expect(onEvent).toHaveBeenCalledWith(printChecksEvents.PRINT_CHECKS_CLOSE)
  })
})
