import { HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DocumentSigner } from './DocumentSigner'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { companyEvents } from '@/shared/constants'
import { handleGetAllSignatories } from '@/test/mocks/apis/company_signatories'
import { handleGetAllCompanyForms } from '@/test/mocks/apis/company_forms'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('DocumentSigner', () => {
  beforeEach(() => {
    setupApiTestMocks()
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

  it('remains editable after the "done" event instead of getting stuck on the list view', async () => {
    const user = userEvent.setup()
    const onEvent = vi.fn()

    renderWithProviders(
      <DocumentSigner companyId="company-123" signatoryId="signatory-123" onEvent={onEvent} />,
    )

    const continueButton = await screen.findByRole('button', { name: 'Continue' })
    await user.click(continueButton)
    expect(onEvent).toHaveBeenCalledWith(companyEvents.COMPANY_FORMS_DONE, undefined)

    const signButton = await screen.findByRole('button', { name: 'Sign document' })
    await user.click(signButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sign form' })).toBeInTheDocument()
    })
  })
})
