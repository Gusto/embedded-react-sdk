import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DismissalPayPeriodSelectionPresentation } from './DismissalPayPeriodSelectionPresentation'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const defaultProps = {
  payPeriodOptions: [
    { value: '0', label: 'Dec 1, 2024 – Dec 14, 2024 (Jane Doe)' },
    { value: '1', label: 'Dec 15, 2024 – Dec 28, 2024 (Jane Doe)' },
  ],
  selectedPeriodIndex: undefined as string | undefined,
  onSelectPeriod: vi.fn(),
  onSubmit: vi.fn(),
  isPending: false,
}

describe('DismissalPayPeriodSelectionPresentation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page title and description', async () => {
    renderWithProviders(<DismissalPayPeriodSelectionPresentation {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /run dismissal payroll/i })).toBeInTheDocument()
    })

    expect(
      screen.getByText(/select the pay period for the terminated employee/i),
    ).toBeInTheDocument()
  })

  it('renders the pay period select with label', async () => {
    renderWithProviders(<DismissalPayPeriodSelectionPresentation {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByLabelText(/pay period/i)).toBeInTheDocument()
    })
  })

  it('renders the continue button', async () => {
    renderWithProviders(<DismissalPayPeriodSelectionPresentation {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
    })
  })

  it('disables continue button when no period is selected', async () => {
    renderWithProviders(<DismissalPayPeriodSelectionPresentation {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled()
    })
  })

  it('enables continue button when a period is selected', async () => {
    renderWithProviders(
      <DismissalPayPeriodSelectionPresentation {...defaultProps} selectedPeriodIndex="0" />,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled()
    })
  })

  it('calls onSubmit when continue is clicked', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <DismissalPayPeriodSelectionPresentation
        {...defaultProps}
        selectedPeriodIndex="0"
        onSubmit={onSubmit}
      />,
    )

    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('shows loading state when isPending', async () => {
    renderWithProviders(
      <DismissalPayPeriodSelectionPresentation
        {...defaultProps}
        selectedPeriodIndex="0"
        isPending={true}
      />,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled()
    })
  })

  describe('empty state', () => {
    it('shows empty state when no pay period options exist', async () => {
      renderWithProviders(
        <DismissalPayPeriodSelectionPresentation {...defaultProps} payPeriodOptions={[]} />,
      )

      await waitFor(() => {
        expect(screen.getByText(/no unprocessed termination pay periods/i)).toBeInTheDocument()
      })

      expect(screen.queryByRole('button', { name: /continue/i })).not.toBeInTheDocument()
    })
  })
})
