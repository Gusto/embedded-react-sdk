import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { FileInput } from './FileInput'
import type { FileInputProps } from './FileInputTypes'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('FileInput', () => {
  const defaultProps: FileInputProps = {
    label: 'Upload document',
    value: null,
    onChange: vi.fn(),
  }

  const createMockFile = (name: string, size: number, type: string): File => {
    const file = new File(['test content'], name, { type })
    Object.defineProperty(file, 'size', { value: size })
    return file
  }

  it('renders upload button with instructions', () => {
    renderWithProviders(<FileInput {...defaultProps} />)

    expect(screen.getByText('Click to upload')).toBeInTheDocument()
    expect(screen.getByText(/or drag and drop/)).toBeInTheDocument()
  })

  it('renders accepted types hint when accept prop is provided', () => {
    renderWithProviders(
      <FileInput {...defaultProps} accept={['image/jpeg', 'image/png', 'application/pdf']} />,
    )

    expect(screen.getByText('Only JPG, PNG, PDF files are permitted')).toBeInTheDocument()
  })

  it('does not render accepted types hint when accept is not provided', () => {
    renderWithProviders(<FileInput {...defaultProps} />)

    expect(screen.queryByText(/Only .* files are permitted/)).not.toBeInTheDocument()
  })

  it('does not render accepted types hint when accept includes wildcard', () => {
    renderWithProviders(<FileInput {...defaultProps} accept={['*/*']} />)

    expect(screen.queryByText(/Only .* files are permitted/)).not.toBeInTheDocument()
  })

  it('renders accepted types from file extensions', () => {
    renderWithProviders(<FileInput {...defaultProps} accept={['.jpg', '.pdf']} />)

    expect(screen.getByText('Only JPG, PDF files are permitted')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    renderWithProviders(<FileInput {...defaultProps} description="Maximum file size: 10MB" />)

    expect(screen.getByText('Maximum file size: 10MB')).toBeInTheDocument()
  })

  it('renders both accepted types hint and description', () => {
    renderWithProviders(
      <FileInput {...defaultProps} accept={['image/jpeg']} description="Maximum file size: 10MB" />,
    )

    expect(screen.getByText('Only JPG files are permitted')).toBeInTheDocument()
    expect(screen.getByText('Maximum file size: 10MB')).toBeInTheDocument()
  })

  describe('with file selected', () => {
    it('renders file name and size', () => {
      const mockFile = createMockFile('document.pdf', 1024 * 500, 'application/pdf')

      renderWithProviders(<FileInput {...defaultProps} value={mockFile} />)

      expect(screen.getByText('document.pdf')).toBeInTheDocument()
      expect(screen.getByText('500 KB')).toBeInTheDocument()
    })

    it('renders remove button', () => {
      const mockFile = createMockFile('document.pdf', 1024, 'application/pdf')

      renderWithProviders(<FileInput {...defaultProps} value={mockFile} />)

      expect(screen.getByRole('button', { name: 'Remove file' })).toBeInTheDocument()
    })

    it('calls onChange with null when remove button is clicked', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const mockFile = createMockFile('document.pdf', 1024, 'application/pdf')

      renderWithProviders(<FileInput {...defaultProps} value={mockFile} onChange={onChange} />)

      await user.click(screen.getByRole('button', { name: 'Remove file' }))

      expect(onChange).toHaveBeenCalledWith(null)
    })
  })

  describe('file size formatting', () => {
    it('formats 0 bytes correctly', () => {
      const mockFile = createMockFile('test.pdf', 0, 'application/pdf')
      renderWithProviders(<FileInput {...defaultProps} value={mockFile} />)
      expect(screen.getByText('0 Bytes')).toBeInTheDocument()
    })

    it('formats bytes correctly', () => {
      const mockFile = createMockFile('test.pdf', 500, 'application/pdf')
      renderWithProviders(<FileInput {...defaultProps} value={mockFile} />)
      expect(screen.getByText('500 Bytes')).toBeInTheDocument()
    })

    it('formats kilobytes correctly', () => {
      const mockFile = createMockFile('test.pdf', 1024, 'application/pdf')
      renderWithProviders(<FileInput {...defaultProps} value={mockFile} />)
      expect(screen.getByText('1 KB')).toBeInTheDocument()
    })

    it('formats megabytes correctly', () => {
      const mockFile = createMockFile('test.pdf', 1024 * 1024, 'application/pdf')
      renderWithProviders(<FileInput {...defaultProps} value={mockFile} />)
      expect(screen.getByText('1 MB')).toBeInTheDocument()
    })

    it('formats gigabytes correctly', () => {
      const mockFile = createMockFile('test.pdf', 1024 * 1024 * 1024, 'application/pdf')
      renderWithProviders(<FileInput {...defaultProps} value={mockFile} />)
      expect(screen.getByText('1 GB')).toBeInTheDocument()
    })
  })

  describe('disabled state', () => {
    it('disables the upload button when isDisabled is true', () => {
      renderWithProviders(<FileInput {...defaultProps} isDisabled />)

      const triggerButton = screen.getByText('Click to upload').closest('button')
      expect(triggerButton).toBeDisabled()
    })

    it('disables the remove button when isDisabled is true and file is selected', () => {
      const mockFile = createMockFile('document.pdf', 1024, 'application/pdf')

      renderWithProviders(<FileInput {...defaultProps} value={mockFile} isDisabled />)

      expect(screen.getByRole('button', { name: 'Remove file' })).toBeDisabled()
    })
  })

  describe('error state', () => {
    it('renders error message when isInvalid and errorMessage are provided', () => {
      renderWithProviders(
        <FileInput {...defaultProps} isInvalid errorMessage="This field is required" />,
      )

      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has no violations in default state', async () => {
      const { container } = renderWithProviders(<FileInput {...defaultProps} />)
      await expectNoAxeViolations(container)
    })

    it('has no violations with file selected', async () => {
      const mockFile = createMockFile('test.pdf', 1024, 'application/pdf')
      const { container } = renderWithProviders(<FileInput {...defaultProps} value={mockFile} />)
      await expectNoAxeViolations(container)
    })

    it('has no violations in error state', async () => {
      const { container } = renderWithProviders(
        <FileInput {...defaultProps} isInvalid errorMessage="This field is required" />,
      )
      await expectNoAxeViolations(container)
    })
  })
})
