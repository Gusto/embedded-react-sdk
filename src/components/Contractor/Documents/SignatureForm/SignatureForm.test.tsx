import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { SignatureForm } from './SignatureForm'
import { server } from '@/test/mocks/server'
import {
  handleSignContractorDocument,
  W9_DOCUMENT_UUID,
} from '@/test/mocks/apis/contractor_documents'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { contractorEvents, componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

interface SignRequestBody {
  fields: Array<{ key: string; value: string }>
  agree: boolean
}

describe('Contractor SignatureForm', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  const contractorId = 'contractor-123'

  function renderForm(onEvent = vi.fn()) {
    renderWithProviders(
      <SignatureForm
        contractorId={contractorId}
        documentUuid={W9_DOCUMENT_UUID}
        onEvent={onEvent}
      />,
    )
    return onEvent
  }

  it('prefills editable inputs from the document fields', async () => {
    renderForm()

    await screen.findByRole('button', { name: 'Sign' })
    expect(screen.getByLabelText('Entity or individual name (1)')).toHaveValue('Klay Thompson')
  })

  it('shows the masked SSN as a placeholder instead of seeding it as the value', async () => {
    renderForm()

    await screen.findByRole('button', { name: 'Sign' })
    const ssnInput = screen.getByLabelText('Social Security Number (SSN)')
    expect(ssnInput).toHaveValue('')
    expect(ssnInput).toHaveAttribute('placeholder', 'XXX-XX-3123')
  })

  it('does not send the masked SSN back in the sign payload', async () => {
    let signBody: SignRequestBody | null = null
    const signResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      signBody = (await request.json()) as SignRequestBody
      return HttpResponse.json({ uuid: W9_DOCUMENT_UUID, signed_at: '2025-06-26T00:00:00Z' })
    })
    server.use(handleSignContractorDocument(signResolver))

    const user = userEvent.setup()
    renderForm()

    await screen.findByRole('button', { name: 'Sign' })
    await user.click(screen.getByRole('radio', { name: 'C-Corporation' }))
    await user.type(screen.getByLabelText('Signature'), 'Klay Thompson')
    await user.click(
      screen.getByRole('checkbox', { name: 'I agree to electronically sign this form.' }),
    )
    await user.click(screen.getByRole('button', { name: 'Sign' }))

    await waitFor(() => {
      expect(signResolver).toHaveBeenCalledTimes(1)
    })
    expect(signBody!.fields.find(f => f.key === 'ssn')).toBeUndefined()
  })

  it('renders the tax classification as a single radio group', async () => {
    renderForm()

    await screen.findByRole('button', { name: 'Sign' })
    expect(screen.getByRole('radio', { name: 'C-Corporation' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'LLC' })).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: 'C-Corporation' })).not.toBeInTheDocument()
  })

  it('reveals the LLC code select only after the LLC classification is chosen', async () => {
    const user = userEvent.setup()
    renderForm()

    await screen.findByRole('button', { name: 'Sign' })
    expect(screen.queryByLabelText('LLC tax classification code')).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'LLC' }))
    expect(screen.getByLabelText('LLC tax classification code')).toBeInTheDocument()
  })

  it('blocks submission and skips the API when consent is not given', async () => {
    const signResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json({ uuid: W9_DOCUMENT_UUID, signed_at: '2025-01-01T00:00:00Z' }),
    )
    server.use(handleSignContractorDocument(signResolver))

    const user = userEvent.setup()
    renderForm()

    await screen.findByRole('button', { name: 'Sign' })
    await user.click(screen.getByRole('radio', { name: 'C-Corporation' }))
    await user.click(screen.getByRole('button', { name: 'Sign' }))

    expect(
      await screen.findByText('You must agree to electronically sign this form.'),
    ).toBeInTheDocument()
    expect(signResolver).not.toHaveBeenCalled()
  })

  it('signs the document and emits the signed document, mapping the classification to the W-9 wire format', async () => {
    let signBody: SignRequestBody | null = null
    const signResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      signBody = (await request.json()) as SignRequestBody
      return HttpResponse.json({
        uuid: W9_DOCUMENT_UUID,
        title: 'W-9',
        requires_signing: false,
        signed_at: '2025-06-26T00:00:00Z',
      })
    })
    server.use(handleSignContractorDocument(signResolver))

    const onEvent = renderForm()
    const user = userEvent.setup()

    await screen.findByRole('button', { name: 'Sign' })
    await user.click(screen.getByRole('radio', { name: 'C-Corporation' }))
    await user.type(screen.getByLabelText('Signature'), 'Klay Thompson')
    await user.click(
      screen.getByRole('checkbox', { name: 'I agree to electronically sign this form.' }),
    )
    await user.click(screen.getByRole('button', { name: 'Sign' }))

    await waitFor(() => {
      expect(signResolver).toHaveBeenCalledTimes(1)
    })

    expect(signBody).toMatchObject({ agree: true })
    expect(signBody!.fields).toContainEqual({ key: 'c_corporation', value: '1' })
    expect(signBody!.fields).toContainEqual({ key: 'signature_text', value: 'Klay Thompson' })

    expect(onEvent).toHaveBeenCalledWith(
      contractorEvents.CONTRACTOR_SIGN_DOCUMENT,
      expect.objectContaining({ uuid: W9_DOCUMENT_UUID }),
    )
  })

  it('emits CANCEL when navigating back', async () => {
    const onEvent = renderForm()
    const user = userEvent.setup()

    await screen.findByRole('button', { name: 'Back' })
    await user.click(screen.getByRole('button', { name: 'Back' }))

    expect(onEvent).toHaveBeenCalledWith(componentEvents.CANCEL)
  })
})
