import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { CompanyForms } from './CompanyForms'
import { server } from '@/test/mocks/server'
import { handleGetAllCompanyForms } from '@/test/mocks/apis/company_forms'
import { handleGetAllSignatories } from '@/test/mocks/apis/company_signatories'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const COMPANY_ID = 'company-123'
const VIEWER_SIGNATORY_ID = 'signatory-1'
const unstableFeatures = { companySettingsDashboard: true }

const unsignedForm = {
  uuid: 'form-8655',
  name: 'US_8655',
  title: 'Form 8655 Reporting Agent Authorization',
  requires_signing: true,
}

const fixtureSignatory = {
  uuid: VIEWER_SIGNATORY_ID,
  first_name: 'Ada',
  last_name: 'Lovelace',
  email: 'ada@example.com',
  title: 'PRESIDENT',
  identity_verification_status: 'Pass',
  version: 'signatory-version',
}

async function openSurface(user: ReturnType<typeof userEvent.setup>) {
  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Manage company documents' })).toBeEnabled()
  })
  await user.click(screen.getByRole('button', { name: 'Manage company documents' }))
}

describe('CompanyManagement.CompanyForms', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(
      handleGetAllCompanyForms(() => HttpResponse.json([unsignedForm])),
      handleGetAllSignatories(() => HttpResponse.json([fixtureSignatory])),
    )
  })

  it('renders the SDK error card instead of the block without the companySettingsDashboard flag', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    renderWithProviders(<CompanyForms companyId={COMPANY_ID} onEvent={onEvent} />)

    expect(await screen.findByTestId('internal-error-card')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Manage company documents' })).toBeNull()

    consoleErrorSpy.mockRestore()
  })

  it('opens the document surface without an onboarding Continue', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CompanyForms companyId={COMPANY_ID} onEvent={onEvent} />, {
      unstableFeatures,
    })

    await openSurface(user)

    expect(await screen.findByText(unsignedForm.title)).toBeInTheDocument()
    // The management list is a resting screen; the block's back header is the way out.
    expect(screen.queryByRole('button', { name: 'Continue' })).toBeNull()
  })

  it('is review-only when no viewer is declared', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CompanyForms companyId={COMPANY_ID} onEvent={onEvent} />, {
      unstableFeatures,
    })

    await openSurface(user)
    await screen.findByText(unsignedForm.title)

    // Signing stays bound to viewerSignatoryId; inferring it would let anyone who opens the
    // block sign the company's federal tax forms.
    expect(screen.queryByRole('button', { name: 'Sign document' })).toBeNull()
  })

  it('offers signing to the declared viewer and surfaces the alert once they leave', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CompanyForms
        companyId={COMPANY_ID}
        viewerSignatoryId={VIEWER_SIGNATORY_ID}
        onEvent={onEvent}
      />,
      { unstableFeatures },
    )

    await openSurface(user)
    await user.click(await screen.findByRole('button', { name: 'Sign document' }))

    await user.type(await screen.findByLabelText('Signature'), 'Ada Lovelace')
    await user.click(
      screen.getByRole('checkbox', {
        name: 'I am the signatory and I agree to sign electronically',
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Sign form' }))

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.COMPANY_MANAGEMENT_COMPANY_FORMS_UPDATED,
        expect.anything(),
      )
    })
    // Signing keeps the surface open, so no alert yet.
    expect(screen.queryByText('Documents signed.')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Back to company documents' }))

    expect(await screen.findByText('Documents signed.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Manage company documents' })).toBeInTheDocument()
  })
})
