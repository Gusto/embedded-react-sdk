import { HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DocumentList } from './DocumentList'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { companyEvents } from '@/shared/constants'
import { handleGetAllSignatories } from '@/test/mocks/apis/company_signatories'
import { handleGetAllCompanyForms } from '@/test/mocks/apis/company_forms'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('DocumentList', () => {
  beforeEach(() => {
    setupApiTestMocks()
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
