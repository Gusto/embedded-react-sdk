import { expect, describe, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GrossUpModal } from './GrossUpModal'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

vi.mock('@/components/Base', () => ({
  useBase: () => ({
    onEvent: vi.fn(),
    baseSubmitHandler: vi.fn((data: unknown, callback: (data: unknown) => Promise<void>) =>
      callback(data),
    ),
    fieldErrors: [],
    setError: vi.fn(),
  }),
}))

const defaultProps = {
  isOpen: true,
  onCalculateGrossUp: vi.fn(),
  isPending: false,
  onApply: vi.fn(),
  onCancel: vi.fn(),
}

describe('GrossUpModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
    Object.defineProperty(HTMLDialogElement.prototype, 'open', {
      get: vi.fn(() => false),
      set: vi.fn(),
      configurable: true,
    })
  })

  it('renders modal with net pay input when open', async () => {
    renderWithProviders(<GrossUpModal {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Enter a net amount')).toBeInTheDocument()
    })

    expect(screen.getByText(/net amount you want this employee/)).toBeInTheDocument()
    expect(screen.getByLabelText('Net amount')).toBeInTheDocument()
    expect(screen.getByText('Calculate Gross from Net')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('does not open the dialog when closed', () => {
    const showModalSpy = vi.spyOn(HTMLDialogElement.prototype, 'showModal')
    renderWithProviders(<GrossUpModal {...defaultProps} isOpen={false} />)

    expect(showModalSpy).not.toHaveBeenCalled()
  })

  it('calls onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<GrossUpModal {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Cancel'))

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onCalculateGrossUp and displays result on calculate', async () => {
    const onCalculateGrossUp = vi.fn().mockResolvedValue('5000.00')
    const user = userEvent.setup()
    renderWithProviders(<GrossUpModal {...defaultProps} onCalculateGrossUp={onCalculateGrossUp} />)

    await waitFor(() => {
      expect(screen.getByLabelText('Net amount')).toBeInTheDocument()
    })

    const netPayInput = screen.getByLabelText('Net amount')
    await user.clear(netPayInput)
    await user.type(netPayInput, '3500')

    await user.click(screen.getByText('Calculate Gross from Net'))

    await waitFor(() => {
      expect(screen.getByText('Calculated gross pay')).toBeInTheDocument()
      expect(screen.getByText('$5,000.00')).toBeInTheDocument()
    })

    expect(onCalculateGrossUp).toHaveBeenCalledWith(3500)
    expect(screen.getByText('Apply')).toBeInTheDocument()
  })

  it('calls onApply with gross amount when Apply is clicked', async () => {
    const onCalculateGrossUp = vi.fn().mockResolvedValue('5000.00')
    const user = userEvent.setup()
    renderWithProviders(<GrossUpModal {...defaultProps} onCalculateGrossUp={onCalculateGrossUp} />)

    await waitFor(() => {
      expect(screen.getByLabelText('Net amount')).toBeInTheDocument()
    })

    const netPayInput = screen.getByLabelText('Net amount')
    await user.clear(netPayInput)
    await user.type(netPayInput, '3500')
    await user.click(screen.getByText('Calculate Gross from Net'))

    await waitFor(() => {
      expect(screen.getByText('Apply')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Apply'))

    expect(defaultProps.onApply).toHaveBeenCalledWith('5000.00')
  })

  it('shows error message when onCalculateGrossUp returns null', async () => {
    const onCalculateGrossUp = vi.fn().mockResolvedValue(null)
    const user = userEvent.setup()
    renderWithProviders(<GrossUpModal {...defaultProps} onCalculateGrossUp={onCalculateGrossUp} />)

    await waitFor(() => {
      expect(screen.getByLabelText('Net amount')).toBeInTheDocument()
    })

    const netPayInput = screen.getByLabelText('Net amount')
    await user.clear(netPayInput)
    await user.type(netPayInput, '3500')
    await user.click(screen.getByText('Calculate Gross from Net'))

    await waitFor(() => {
      expect(
        screen.getByText('Unable to calculate gross up. Please try again.'),
      ).toBeInTheDocument()
    })
  })

  it('displays warning banner only after calculation', async () => {
    const onCalculateGrossUp = vi.fn().mockResolvedValue('5000.00')
    const user = userEvent.setup()
    renderWithProviders(<GrossUpModal {...defaultProps} onCalculateGrossUp={onCalculateGrossUp} />)

    await waitFor(() => {
      expect(screen.getByLabelText('Net amount')).toBeInTheDocument()
    })

    expect(
      screen.queryByText('This will override any previously entered amounts.'),
    ).not.toBeInTheDocument()

    const netPayInput = screen.getByLabelText('Net amount')
    await user.clear(netPayInput)
    await user.type(netPayInput, '3500')
    await user.click(screen.getByText('Calculate Gross from Net'))

    await waitFor(() => {
      expect(
        screen.getByText('This will override any previously entered amounts.'),
      ).toBeInTheDocument()
    })
  })
})
