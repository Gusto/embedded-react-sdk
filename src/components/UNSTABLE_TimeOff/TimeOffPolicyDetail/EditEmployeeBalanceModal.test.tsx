import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditEmployeeBalanceModal } from './EditEmployeeBalanceModal'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('EditEmployeeBalanceModal', () => {
  const onClose = vi.fn()
  const onConfirm = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  function renderModal(overrides = {}) {
    return renderWithProviders(
      <EditEmployeeBalanceModal
        isOpen
        onClose={onClose}
        employeeName="Alexander Hamilton"
        currentBalance={80}
        onConfirm={onConfirm}
        isPending={false}
        {...overrides}
      />,
    )
  }

  it('renders the title with employee name', async () => {
    renderModal()

    await waitFor(() => {
      expect(screen.getByText('Edit Alexander Hamilton time off balance')).toBeInTheDocument()
    })
  })

  it('renders the balance input label', async () => {
    renderModal()

    await waitFor(() => {
      expect(screen.getByText('Balance (hrs)')).toBeInTheDocument()
    })
  })

  it('calls onConfirm with the balance value when Update balance is clicked', async () => {
    const user = userEvent.setup()
    renderModal()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Update balance' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Update balance' }))
    expect(onConfirm).toHaveBeenCalledWith(80)
  })

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderModal()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows loading state when isPending', async () => {
    renderModal({ isPending: true })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Update balance' })).toBeInTheDocument()
    })

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    expect(cancelButton).toBeDisabled()
  })

  describe('accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = renderModal()

      await waitFor(() => {
        expect(screen.getByText('Edit Alexander Hamilton time off balance')).toBeInTheDocument()
      })

      await expectNoAxeViolations(container)
    })
  })
})
