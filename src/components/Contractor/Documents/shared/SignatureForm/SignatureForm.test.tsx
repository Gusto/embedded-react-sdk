import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { SignatureForm } from './SignatureForm'
import { server } from '@/test/mocks/server'
import {
  handleSignContractorDocument,
  handleGetContractorDocument,
  buildW9Document,
  w9DocumentFields,
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

  it('shows the on-file SSN masked and locked, revealing an empty input after Change', async () => {
    const user = userEvent.setup()
    renderForm()

    await screen.findByRole('button', { name: 'Sign' })
    const lockedSsn = screen.getByLabelText(/Social Security Number \(SSN\)/)
    expect(lockedSsn).toHaveValue('XXX-XX-3123')
    expect(lockedSsn).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Change SSN' }))

    // The redacted SSN is optional (a value is already on file), so its label
    // carries an "(optional)" suffix — match on the stable prefix.
    const editableSsn = screen.getByLabelText(/Social Security Number \(SSN\)/)
    expect(editableSsn).toHaveValue('')
    expect(editableSsn).toBeEnabled()
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

  it('auto-formats SSN input as XXX-XX-XXXX once the field is editable', async () => {
    const user = userEvent.setup()
    renderForm()

    await screen.findByRole('button', { name: 'Sign' })
    await user.click(screen.getByRole('button', { name: 'Change SSN' }))
    const ssnInput = screen.getByLabelText(/Social Security Number \(SSN\)/)
    await user.type(ssnInput, '123456789')
    expect(ssnInput).toHaveValue('123-45-6789')
  })

  it('hides the non-applicable EIN for an individual and still submits ein N/A', async () => {
    let signBody: SignRequestBody | null = null
    const signResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      signBody = (await request.json()) as SignRequestBody
      return HttpResponse.json({ uuid: W9_DOCUMENT_UUID, signed_at: '2025-06-26T00:00:00Z' })
    })
    server.use(handleSignContractorDocument(signResolver))

    const user = userEvent.setup()
    renderForm()

    await screen.findByRole('button', { name: 'Sign' })
    expect(
      screen.queryByLabelText(/Employer Identification Number \(EIN\)/),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Change EIN' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'C-Corporation' }))
    await user.type(screen.getByLabelText('Signature'), 'Klay Thompson')
    await user.click(
      screen.getByRole('checkbox', { name: 'I agree to electronically sign this form.' }),
    )
    await user.click(screen.getByRole('button', { name: 'Sign' }))

    await waitFor(() => {
      expect(signResolver).toHaveBeenCalledTimes(1)
    })
    expect(signBody!.fields).toContainEqual({ key: 'ein', value: 'N/A' })
  })

  it('locks the on-file EIN for a business, hides the SSN, and submits ssn N/A', async () => {
    const businessFields = w9DocumentFields.map(field => {
      if (field.key === 'ssn') return { ...field, value: 'N/A' }
      if (field.key === 'ein') return { ...field, value: 'XX-XXX4567' }
      return field
    })
    server.use(
      handleGetContractorDocument(() =>
        HttpResponse.json(buildW9Document({ fields: businessFields })),
      ),
    )
    let signBody: SignRequestBody | null = null
    const signResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      signBody = (await request.json()) as SignRequestBody
      return HttpResponse.json({ uuid: W9_DOCUMENT_UUID, signed_at: '2025-06-26T00:00:00Z' })
    })
    server.use(handleSignContractorDocument(signResolver))

    const user = userEvent.setup()
    renderForm()

    await screen.findByRole('button', { name: 'Sign' })
    const lockedEin = screen.getByLabelText(/Employer Identification Number \(EIN\)/)
    expect(lockedEin).toHaveValue('XX-XXX4567')
    expect(lockedEin).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Change EIN' })).toBeInTheDocument()
    expect(screen.queryByLabelText(/Social Security Number \(SSN\)/)).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'C-Corporation' }))
    await user.type(screen.getByLabelText('Signature'), 'Klay Thompson')
    await user.click(
      screen.getByRole('checkbox', { name: 'I agree to electronically sign this form.' }),
    )
    await user.click(screen.getByRole('button', { name: 'Sign' }))

    await waitFor(() => {
      expect(signResolver).toHaveBeenCalledTimes(1)
    })
    expect(signBody!.fields).toContainEqual({ key: 'ssn', value: 'N/A' })
    // The on-file EIN was left untouched, so its mask is omitted rather than sent back.
    expect(signBody!.fields.find(f => f.key === 'ein')).toBeUndefined()
  })

  it('rejects a malformed SSN with a validation message', async () => {
    const user = userEvent.setup()
    renderForm()

    await screen.findByRole('button', { name: 'Sign' })
    await user.click(screen.getByRole('button', { name: 'Change SSN' }))
    await user.type(screen.getByLabelText(/Social Security Number \(SSN\)/), '123')
    await user.click(screen.getByRole('radio', { name: 'C-Corporation' }))
    await user.type(screen.getByLabelText('Signature'), 'Klay Thompson')
    await user.click(
      screen.getByRole('checkbox', { name: 'I agree to electronically sign this form.' }),
    )
    await user.click(screen.getByRole('button', { name: 'Sign' }))

    expect(await screen.findByText('Enter a valid Social Security Number.')).toBeInTheDocument()
  })

  it('does not render an optional field the API omits (presence gate)', async () => {
    server.use(
      handleGetContractorDocument(() =>
        HttpResponse.json(
          buildW9Document({
            fields: w9DocumentFields.filter(field => field.key !== 'business_name'),
          }),
        ),
      ),
    )

    renderForm()

    await screen.findByRole('button', { name: 'Sign' })
    expect(screen.getByLabelText('Entity or individual name (1)')).toBeInTheDocument()
    expect(screen.queryByLabelText('Business name (2)')).not.toBeInTheDocument()
  })

  it('presence-gates core fields too, guarding against API divergence', async () => {
    server.use(
      handleGetContractorDocument(() =>
        HttpResponse.json(
          buildW9Document({
            fields: w9DocumentFields.filter(field => field.key !== 'name'),
          }),
        ),
      ),
    )

    renderForm()

    await screen.findByRole('button', { name: 'Sign' })
    expect(screen.queryByLabelText('Entity or individual name (1)')).not.toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'C-Corporation' })).toBeInTheDocument()
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

  it('links to the IRS W-9 instructions and a downloadable PDF', async () => {
    renderForm()

    await screen.findByRole('button', { name: 'Sign' })

    const instructionsLink = screen.getByRole('link', {
      name: 'See the IRS Form W-9 for instructions on completing this form',
    })
    expect(instructionsLink).toHaveAttribute(
      'href',
      'https://www.irs.gov/forms-pubs/about-form-w-9',
    )

    const downloadLink = screen.getByRole('link', { name: 'Download document' })
    expect(downloadLink).toHaveAttribute('href', 'https://gusto-test.com/docs/w9.pdf')
  })

  it('emits CANCEL when navigating back', async () => {
    const onEvent = renderForm()
    const user = userEvent.setup()

    await screen.findByRole('button', { name: 'Back' })
    await user.click(screen.getByRole('button', { name: 'Back' }))

    expect(onEvent).toHaveBeenCalledWith(componentEvents.CANCEL)
  })
})
