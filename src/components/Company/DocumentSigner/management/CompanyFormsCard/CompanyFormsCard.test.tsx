import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { CompanyFormsCard } from './CompanyFormsCard'
import { server } from '@/test/mocks/server'
import { handleGetAllCompanyForms } from '@/test/mocks/apis/company_forms'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const signedForm = {
  uuid: 'form-signed',
  name: 'US_941',
  title: "Employer's Quarterly Federal Tax Return",
  requires_signing: false,
}

const unsignedForm = {
  uuid: 'form-8655',
  name: 'US_8655',
  title: 'Form 8655 Reporting Agent Authorization',
  requires_signing: true,
}

describe('CompanyFormsCard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('counts and names the forms awaiting signature alongside the document total', async () => {
    server.use(
      handleGetAllCompanyForms(() =>
        HttpResponse.json([
          signedForm,
          unsignedForm,
          { ...unsignedForm, uuid: 'form-2678', title: 'Form 2678 Employer Appointment of Agent' },
        ]),
      ),
    )

    renderWithProviders(<CompanyFormsCard companyId="company-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage company documents' })).toBeEnabled()
    })

    expect(screen.getByRole('heading', { name: 'Documents' })).toBeInTheDocument()
    expect(screen.getByText('2 forms awaiting signature')).toBeInTheDocument()
    expect(screen.getByText('Form 8655 Reporting Agent Authorization')).toBeInTheDocument()
    expect(screen.getByText('Form 2678 Employer Appointment of Agent')).toBeInTheDocument()
    expect(screen.getByText('3 documents')).toBeInTheDocument()
  })

  it('reports that nothing is outstanding when every form is signed', async () => {
    server.use(handleGetAllCompanyForms(() => HttpResponse.json([signedForm])))

    renderWithProviders(<CompanyFormsCard companyId="company-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('All forms signed')).toBeInTheDocument()
    })

    // With nothing outstanding the card drops the per-form list rather than
    // rendering an empty row.
    expect(screen.getByText('1 document')).toBeInTheDocument()
    expect(screen.queryByText('Awaiting signature')).toBeNull()
  })

  it('emits the edit-requested event with the company id when Manage is clicked', async () => {
    const user = userEvent.setup()
    server.use(handleGetAllCompanyForms(() => HttpResponse.json([unsignedForm])))

    renderWithProviders(<CompanyFormsCard companyId="company-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage company documents' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Manage company documents' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.COMPANY_MANAGEMENT_COMPANY_FORMS_EDIT_REQUESTED,
      { companyId: 'company-123' },
    )
  })

  it('renders the empty state when the company has no documents', async () => {
    server.use(handleGetAllCompanyForms(() => HttpResponse.json([])))

    renderWithProviders(<CompanyFormsCard companyId="company-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('No company documents yet')).toBeInTheDocument()
    })
  })
})
