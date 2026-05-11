import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Dialog } from './Dialog'
import { DialogDefaults } from './DialogTypes'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { ComponentsProvider } from '@/contexts/ComponentAdapter/ComponentsProvider'
import { defaultComponents } from '@/contexts/ComponentAdapter/adapters/defaultComponentAdapter'

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
    expect(DialogDefaults.isPrimaryActionLoading).toBe(false)
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

  it('handles isDestructive prop', () => {
    renderWithProviders(<Dialog {...defaultProps} isDestructive={true} />)

    const primaryButton = screen.getByRole('button', { name: 'Confirm', hidden: true })
    expect(primaryButton).toHaveAttribute('data-variant', 'error')
  })

  it('handles isPrimaryActionLoading prop', () => {
    renderWithProviders(<Dialog {...defaultProps} isPrimaryActionLoading={true} />)

    const primaryButton = screen.getByRole('button', { name: 'Confirm', hidden: true })
    expect(primaryButton).toHaveAttribute('data-loading', 'true')
  })

  it('calls onPrimaryActionClick when primary button is clicked', () => {
    const onPrimaryActionClick = vi.fn()
    renderWithProviders(<Dialog {...defaultProps} onPrimaryActionClick={onPrimaryActionClick} />)

    const primaryButton = screen.getByRole('button', { name: 'Confirm', hidden: true })
    primaryButton.click()

    expect(onPrimaryActionClick).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    renderWithProviders(<Dialog {...defaultProps} onClose={onClose} />)

    const closeButton = screen.getByRole('button', { name: 'Cancel', hidden: true })
    closeButton.click()

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders action buttons via the Button component adapter', () => {
    const CustomButton = vi.fn(({ children, onClick }) => (
      <button data-testid="custom-adapter-button" onClick={onClick}>
        {children}
      </button>
    ))

    render(
      <ThemeProvider>
        <ComponentsProvider value={{ ...defaultComponents, Button: CustomButton }}>
          <Dialog {...defaultProps} />
        </ComponentsProvider>
      </ThemeProvider>,
    )

    const adapterButtons = screen.getAllByTestId('custom-adapter-button')
    expect(adapterButtons).toHaveLength(2)
    expect(adapterButtons[0]).toHaveTextContent('Cancel')
    expect(adapterButtons[1]).toHaveTextContent('Confirm')
    expect(CustomButton).toHaveBeenCalled()
  })
})
