import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { DocumentManager } from './DocumentManager'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { handleGetEmployeeForm, handleGetEmployeeFormPdf } from '@/test/mocks/apis/employee_forms'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const viewOnlyForm = {
  uuid: 'form-w4-123',
  name: 'W-4',
  title: 'Form W-4',
  description: 'Federal tax withholding form.',
  requires_signing: false,
  employee_uuid: 'employee-123',
  draft: false,
}

const signingRequiredForm = {
  uuid: 'form-w4-123',
  name: 'W-4',
  title: 'Form W-4',
  description: 'Federal tax withholding form.',
  requires_signing: true,
  employee_uuid: 'employee-123',
  draft: false,
}

const formPdf = {
  uuid: 'form-w4-123',
  document_url: null,
}

describe('DocumentManager', () => {
  const mockOnEvent = vi.fn()
  const defaultProps = {
    employeeId: 'employee-123',
    formId: 'form-w4-123',
    onEvent: mockOnEvent,
  }

  beforeEach(() => {
    setupApiTestMocks()
    mockOnEvent.mockClear()
    server.use(handleGetEmployeeFormPdf(() => HttpResponse.json(formPdf)))
  })

  describe('view-only mode (requiresSigning = false)', () => {
    beforeEach(() => {
      server.use(handleGetEmployeeForm(() => HttpResponse.json(viewOnlyForm)))
    })

    it('renders the form title', async () => {
      renderWithProviders(<DocumentManager {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Form W-4')).toBeInTheDocument()
      })
    })

    it('renders a Back button', async () => {
      renderWithProviders(<DocumentManager {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
      })
    })

    it('does not render signature fields', async () => {
      renderWithProviders(<DocumentManager {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
      })

      expect(screen.queryByLabelText('Signature')).not.toBeInTheDocument()
    })

    it('does not nest an anchor inside the download CTA anchor', async () => {
      const pdfHref = 'https://example.com/form-w4.pdf'
      server.use(
        handleGetEmployeeFormPdf(() => HttpResponse.json({ ...formPdf, document_url: pdfHref })),
      )

      const { container } = renderWithProviders(<DocumentManager {...defaultProps} />)

      await waitFor(() => {
        expect(container.querySelector(`a[href="${pdfHref}"][download]`)).not.toBeNull()
      })

      // Every anchor must not contain another anchor — nested <a> elements
      // are invalid HTML and trigger a React hydration error.
      Array.from(container.querySelectorAll('a')).forEach(anchor => {
        expect(anchor.querySelector('a')).toBeNull()
      })
    })
  })

  describe('forms that require signing are still read-only (admin-facing)', () => {
    beforeEach(() => {
      server.use(handleGetEmployeeForm(() => HttpResponse.json(signingRequiredForm)))
    })

    it('renders the form read-only with a Back button and no signing UI', async () => {
      renderWithProviders(<DocumentManager {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
      })

      expect(screen.getByText('Form W-4')).toBeInTheDocument()
      expect(screen.queryByLabelText('Signature')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Sign form' })).not.toBeInTheDocument()
    })
  })
})
