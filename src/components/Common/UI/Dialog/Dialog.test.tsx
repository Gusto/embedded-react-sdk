import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { Dialog } from './Dialog'
import { DialogDefaults } from './DialogTypes'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const defaultProps = {
  primaryActionLabel: 'Confirm',
  closeActionLabel: 'Cancel',
  onClose: vi.fn(),
  onPrimaryActionClick: vi.fn(),
  isOpen: false,
}

describe('Dialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock dialog methods since JSDOM doesn't support them
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
    Object.defineProperty(HTMLDialogElement.prototype, 'open', {
      get: vi.fn(() => false),
      set: vi.fn(),
      configurable: true,
    })
  })

  it('applies default props correctly', () => {
    expect(DialogDefaults.isOpen).toBe(false)
    expect(DialogDefaults.isDestructive).toBe(false)
    expect(DialogDefaults.shouldCloseOnBackdropClick).toBe(false)
  })

  it('renders with required button labels', () => {
    renderWithProviders(<Dialog primaryActionLabel="Save" closeActionLabel="Cancel" />)

    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('renders title when provided', () => {
    renderWithProviders(<Dialog {...defaultProps} title="Test Dialog" />)

    expect(screen.getByText('Test Dialog')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('renders children content', () => {
    renderWithProviders(
      <Dialog {...defaultProps}>
        <div>Custom dialog content</div>
      </Dialog>,
    )

    expect(screen.getByText('Custom dialog content')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('calls showModal when isOpen is true', () => {
    const showModalSpy = vi.spyOn(HTMLDialogElement.prototype, 'showModal')
    renderWithProviders(<Dialog {...defaultProps} isOpen={true} />)

    expect(showModalSpy).toHaveBeenCalled()
  })

  it('handles isDestructive prop', () => {
    renderWithProviders(<Dialog {...defaultProps} isDestructive={true} />)

    const primaryButton = screen.getByRole('button', { name: 'Confirm', hidden: true })
    expect(primaryButton).toHaveAttribute('data-variant', 'error')
  })

  it('calls dialog.close when isOpen changes to false', () => {
    vi.useFakeTimers()
    const closeSpy = vi.spyOn(HTMLDialogElement.prototype, 'close')

    // Mock the dialog as being open
    Object.defineProperty(HTMLDialogElement.prototype, 'open', {
      get: vi.fn(() => true),
      set: vi.fn(),
      configurable: true,
    })

    const { rerender } = renderWithProviders(<Dialog {...defaultProps} isOpen={true} />)

    // Change to closed
    rerender(<Dialog {...defaultProps} isOpen={false} />)

    // Should call close after transition timeout
    vi.advanceTimersByTime(200)
    expect(closeSpy).toHaveBeenCalled()

    vi.useRealTimers()
  })
})
