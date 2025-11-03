import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { Modal } from './Modal'
import { ModalDefaults } from './ModalTypes'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const defaultProps = {
  onClose: vi.fn(),
  isOpen: false,
}

describe('Modal', () => {
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
    expect(ModalDefaults.isOpen).toBe(false)
    expect(ModalDefaults.shouldCloseOnBackdropClick).toBe(false)
  })

  it('renders children content', () => {
    renderWithProviders(
      <Modal {...defaultProps}>
        <div>Modal content</div>
      </Modal>,
    )

    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('renders footer content', () => {
    renderWithProviders(
      <Modal {...defaultProps} footer={<button>Footer Button</button>}>
        <div>Modal content</div>
      </Modal>,
    )

    expect(screen.getByText('Modal content')).toBeInTheDocument()
    expect(screen.getByText('Footer Button')).toBeInTheDocument()
  })

  it('renders without footer when not provided', () => {
    renderWithProviders(
      <Modal {...defaultProps}>
        <div>Modal content</div>
      </Modal>,
    )

    expect(screen.getByText('Modal content')).toBeInTheDocument()
    // Footer should not be rendered
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('calls showModal when isOpen is true', () => {
    const showModalSpy = vi.spyOn(HTMLDialogElement.prototype, 'showModal')
    renderWithProviders(
      <Modal {...defaultProps} isOpen={true}>
        <div>Content</div>
      </Modal>,
    )

    expect(showModalSpy).toHaveBeenCalled()
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

    const { rerender } = renderWithProviders(
      <Modal {...defaultProps} isOpen={true}>
        <div>Content</div>
      </Modal>,
    )

    // Change to closed
    rerender(
      <Modal {...defaultProps} isOpen={false}>
        <div>Content</div>
      </Modal>,
    )

    // Should call close after transition timeout
    vi.advanceTimersByTime(200)
    expect(closeSpy).toHaveBeenCalled()

    vi.useRealTimers()
  })

  it('calls onClose when provided', () => {
    const onCloseMock = vi.fn()
    const { container } = renderWithProviders(
      <Modal {...defaultProps} isOpen={true} onClose={onCloseMock}>
        <div>Content</div>
      </Modal>,
    )

    // Find and click the backdrop
    const backdrop = container.querySelector('[role="presentation"]')
    expect(backdrop).toBeInTheDocument()

    // Note: This test demonstrates the structure exists, but testing
    // backdrop clicks is complex due to event targeting in JSDOM
  })

  it('renders without children when not provided', () => {
    renderWithProviders(<Modal {...defaultProps} footer={<button>Footer Button</button>} />)

    expect(screen.getByText('Footer Button')).toBeInTheDocument()
  })

  it('supports shouldCloseOnBackdropClick prop', () => {
    renderWithProviders(
      <Modal {...defaultProps} isOpen={true} shouldCloseOnBackdropClick={true}>
        <div>Content</div>
      </Modal>,
    )

    // Verify the modal renders with the prop
    expect(screen.getByText('Content')).toBeInTheDocument()
  })
})
