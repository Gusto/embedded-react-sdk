import { HttpResponse, type HttpResponseResolver } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { companyFormsGetPdf } from '@gusto/embedded-api/funcs/companyFormsGetPdf'
import type * as CompanyFormsGetPdfModule from '@gusto/embedded-api/funcs/companyFormsGetPdf'
import { DocumentList } from './DocumentList'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { companyEvents } from '@/shared/constants'
import { handleGetAllSignatories } from '@/test/mocks/apis/company_signatories'
import { handleGetAllCompanyForms, handleGetCompanyFormPdf } from '@/test/mocks/apis/company_forms'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

vi.mock('@gusto/embedded-api/funcs/companyFormsGetPdf', async importOriginal => {
  const actual = await importOriginal<typeof CompanyFormsGetPdfModule>()
  return { ...actual, companyFormsGetPdf: vi.fn(actual.companyFormsGetPdf) }
})

describe('DocumentList', () => {
  let anchorClickSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    setupApiTestMocks()
    anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  })

  describe('when user is the signatory', () => {
    beforeEach(() => {
      server.use(
        handleGetAllSignatories(() =>
          HttpResponse.json([
            {
              uuid: 'signatory-123',
              first_name: 'John',
              last_name: 'Doe',
              email: 'john.doe@example.com',
              title: 'CEO',
            },
          ]),
        ),
        handleGetAllCompanyForms(() =>
          HttpResponse.json([
            {
              uuid: 'form-123',
              title: 'Test Form',
              name: 'test name',
              description: 'test description',
              requires_signing: true,
            },
          ]),
        ),
      )
    })

    it('fires the correct event when requesting to sign a form', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()

      renderWithProviders(
        <DocumentList companyId="company-123" signatoryId="signatory-123" onEvent={onEvent} />,
      )

      await waitFor(() => {
        expect(screen.getByText('Test Form')).toBeInTheDocument()
      })

      const signButton = screen.getByRole('button', { name: 'Sign document' })
      await user.click(signButton)

      expect(onEvent).toHaveBeenCalledWith(companyEvents.COMPANY_VIEW_FORM_TO_SIGN, {
        uuid: 'form-123',
        title: 'Test Form',
        name: 'test name',
        description: 'test description',
        requiresSigning: true,
      })
    })

    it('fires the correct event when changing signatory', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()

      renderWithProviders(<DocumentList companyId="company-123" onEvent={onEvent} />)

      await waitFor(() => {
        expect(screen.getByText('Test Form')).toBeInTheDocument()
      })

      const changeSignatoryButton = screen.getByRole('button', { name: 'Change signatory' })
      await user.click(changeSignatoryButton)

      expect(onEvent).toHaveBeenCalledWith(companyEvents.COMPANY_FORM_EDIT_SIGNATORY, {
        uuid: 'signatory-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        title: 'CEO',
      })
    })

    it('fires the correct event when continuing', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()

      renderWithProviders(<DocumentList companyId="company-123" onEvent={onEvent} />)

      await waitFor(() => {
        expect(screen.getByText('Test Form')).toBeInTheDocument()
      })

      const continueButton = screen.getByRole('button', { name: 'Continue' })
      await user.click(continueButton)

      expect(onEvent).toHaveBeenCalledWith(companyEvents.COMPANY_FORMS_DONE)
    })
  })

  describe('form description overrides', () => {
    beforeEach(() => {
      server.use(
        handleGetAllSignatories(() => HttpResponse.json([])),
        handleGetAllCompanyForms(() =>
          HttpResponse.json([
            {
              uuid: 'form-8655',
              title: 'Form 8655: Reporting Agent Authorization',
              name: 'US_8655',
              description:
                'Form 8655 authorizes us to pay and file federal payroll taxes on your behalf.',
              requires_signing: true,
            },
            {
              uuid: 'form-unknown',
              title: 'Some Unrecognized Form',
              name: 'some_unrecognized_form',
              description: 'This description comes straight from the API.',
              requires_signing: false,
            },
          ]),
        ),
      )
    })

    it('renders the API-provided description for a known form name with no override', async () => {
      renderWithProviders(<DocumentList companyId="company-123" onEvent={() => {}} />)

      await waitFor(() => {
        expect(
          screen.getByText(
            'Form 8655 authorizes us to pay and file federal payroll taxes on your behalf.',
          ),
        ).toBeInTheDocument()
      })
    })

    it('renders the API-provided description for a form name outside the known catalog', async () => {
      renderWithProviders(<DocumentList companyId="company-123" onEvent={() => {}} />)

      await waitFor(() => {
        expect(
          screen.getByText('This description comes straight from the API.'),
        ).toBeInTheDocument()
      })
    })

    // Registers a partner dictionary override on the shared i18next instance, which persists
    // for the rest of this file's test run — keep this the last test in the describe block so
    // it doesn't bleed into the "no override" assertions above.
    it('renders the dictionary override when one is provided for a known form name', async () => {
      renderWithProviders(
        <DocumentList
          companyId="company-123"
          onEvent={() => {}}
          dictionary={{
            en: {
              forms: {
                US_8655: {
                  description:
                    'Form 8655 authorizes Gusto to pay and file federal payroll taxes on your behalf.',
                },
              },
            },
          }}
        />,
      )

      await waitFor(() => {
        expect(
          screen.getByText(
            'Form 8655 authorizes Gusto to pay and file federal payroll taxes on your behalf.',
          ),
        ).toBeInTheDocument()
      })
      expect(
        screen.queryByText(
          'Form 8655 authorizes us to pay and file federal payroll taxes on your behalf.',
        ),
      ).not.toBeInTheDocument()
    })
  })

  describe('viewing a completed form', () => {
    beforeEach(() => {
      server.use(
        handleGetAllSignatories(() => HttpResponse.json([])),
        handleGetAllCompanyForms(() =>
          HttpResponse.json([
            {
              uuid: 'form-123',
              title: 'Test Form',
              name: 'test name',
              description: 'test description',
              requires_signing: false,
            },
          ]),
        ),
      )
    })

    it('does not show a view action for a form that still requires signing', async () => {
      server.use(
        handleGetAllCompanyForms(() =>
          HttpResponse.json([
            {
              uuid: 'form-123',
              title: 'Test Form',
              name: 'test name',
              description: 'test description',
              requires_signing: true,
            },
          ]),
        ),
      )

      renderWithProviders(<DocumentList companyId="company-123" onEvent={() => {}} />)

      await waitFor(() => {
        expect(screen.getByText('Test Form')).toBeInTheDocument()
      })

      expect(screen.queryByRole('button', { name: 'View' })).not.toBeInTheDocument()
    })

    it('fetches the pdf url and opens it in an isolated tab when the view action is selected', async () => {
      const pdfResolver = vi.fn<HttpResponseResolver>(() =>
        HttpResponse.json({ uuid: 'form-123', document_url: 'https://example.com/form-123.pdf' }),
      )
      server.use(handleGetCompanyFormPdf(pdfResolver))

      const user = userEvent.setup()
      renderWithProviders(<DocumentList companyId="company-123" onEvent={() => {}} />)

      await waitFor(() => {
        expect(screen.getByText('Test Form')).toBeInTheDocument()
      })

      const viewButton = screen.getByRole('button', { name: 'View' })
      await user.click(viewButton)

      await waitFor(() => {
        expect(pdfResolver).toHaveBeenCalledTimes(1)
      })
      await waitFor(() => {
        expect(anchorClickSpy).toHaveBeenCalledTimes(1)
      })
      expect(anchorClickSpy.mock.contexts[0]).toHaveProperty(
        'href',
        'https://example.com/form-123.pdf',
      )
      expect(anchorClickSpy.mock.contexts[0]).toHaveProperty('target', '_blank')
      expect(anchorClickSpy.mock.contexts[0]).toHaveProperty('rel', 'noopener noreferrer')
    })

    it('shows an inline error and does not open a tab when the document URL is unsafe', async () => {
      server.use(
        handleGetCompanyFormPdf(() =>
          HttpResponse.json({ uuid: 'form-123', document_url: 'javascript:alert(1)' }),
        ),
      )

      const user = userEvent.setup()
      renderWithProviders(<DocumentList companyId="company-123" onEvent={() => {}} />)

      await waitFor(() => {
        expect(screen.getByText('Test Form')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'View' }))

      await waitFor(() => {
        expect(
          screen.getByText('Could not open this document, try again later.'),
        ).toBeInTheDocument()
      })
      expect(anchorClickSpy).not.toHaveBeenCalled()
    })

    it('shows an inline error without reporting to observability when the pdf request fails', async () => {
      server.use(
        handleGetCompanyFormPdf(() =>
          HttpResponse.json(
            {
              errors: [
                {
                  error_key: 'request',
                  category: 'not_found',
                  message: 'The requested resource was not found.',
                },
              ],
            },
            { status: 404 },
          ),
        ),
      )
      const onError = vi.fn()
      const user = userEvent.setup()

      render(
        <GustoTestProvider observability={{ onError }}>
          <DocumentList companyId="company-123" onEvent={() => {}} />
        </GustoTestProvider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Test Form')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'View' }))

      await waitFor(() => {
        expect(
          screen.getByText('Could not open this document, try again later.'),
        ).toBeInTheDocument()
      })

      expect(onError).not.toHaveBeenCalled()
    })

    it('shows an inline error and reports to observability when fetching the pdf throws', async () => {
      vi.mocked(companyFormsGetPdf).mockRejectedValueOnce(new Error('boom'))
      const onError = vi.fn()
      const user = userEvent.setup()

      render(
        <GustoTestProvider observability={{ onError }}>
          <DocumentList companyId="company-123" onEvent={() => {}} />
        </GustoTestProvider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Test Form')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'View' }))

      await waitFor(() => {
        expect(
          screen.getByText('Could not open this document, try again later.'),
        ).toBeInTheDocument()
      })

      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'internal_error', message: 'boom' }),
      )
    })
  })

  describe('when user is not the signatory', () => {
    beforeEach(() => {
      server.use(
        handleGetAllSignatories(() => HttpResponse.json([])),
        handleGetAllCompanyForms(() =>
          HttpResponse.json([
            {
              uuid: 'form-123',
              title: 'Test Form',
              name: 'test name',
              description: 'test description',
              requires_signing: true,
            },
          ]),
        ),
      )
    })

    it('does not allow the user to sign the form', async () => {
      render(
        <GustoTestProvider>
          <DocumentList companyId="company-123" signatoryId="signatory-123" onEvent={() => {}} />
        </GustoTestProvider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Test Form')).toBeInTheDocument()
      })

      expect(screen.queryByRole('button', { name: 'Sign document' })).not.toBeInTheDocument()
      expect(screen.getByText('Not signed')).toBeInTheDocument()
    })
  })
})
