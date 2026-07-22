import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { ProfileEditForm } from './ProfileEditForm'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { handleGetContractor, handleUpdateContractor } from '@/test/mocks/apis/contractors'
import { componentEvents } from '@/shared/constants'

const baseIndividual = {
  uuid: 'contractor-123',
  company_uuid: 'company-123',
  type: 'Individual',
  first_name: 'Ada',
  last_name: 'Lovelace',
  middle_initial: null,
  start_date: '2024-03-15',
  has_ssn: true,
  has_ein: false,
  email: 'ada.lovelace@example.com',
  wage_type: 'Hourly',
  hourly_rate: '65.00',
  is_active: true,
  version: 'version-123',
  onboarded: true,
  onboarding_status: 'onboarding_completed',
  self_onboarding: false,
  file_new_hire_report: false,
}

const baseBusiness = {
  ...baseIndividual,
  type: 'Business',
  business_name: 'Pacific Design Co.',
  first_name: null,
  last_name: null,
  has_ssn: false,
  has_ein: true,
  ein: null,
}

function mockContractor(overrides: Record<string, unknown> = {}) {
  server.use(handleGetContractor(() => HttpResponse.json({ ...baseIndividual, ...overrides })))
}

describe('ProfileEditForm — individual contractor', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
    mockContractor()
  })

  it('renders a locked SSN field with a Change button when an SSN is already on file', async () => {
    renderWithProviders(<ProfileEditForm contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByDisplayValue('Ada')

    expect(screen.getByDisplayValue('•••-••-••••')).toBeDisabled()
    expect(screen.getByText('Already on file.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument()
  })

  it('reveals an editable SSN input after clicking Change, without submitting the form', async () => {
    const updateResolver = vi.fn<HttpResponseResolver>(() => HttpResponse.json(baseIndividual))
    server.use(handleUpdateContractor(updateResolver))

    const user = userEvent.setup()
    renderWithProviders(<ProfileEditForm contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByDisplayValue('Ada')
    await user.click(screen.getByRole('button', { name: 'Change' }))

    expect(screen.queryByRole('button', { name: 'Change' })).not.toBeInTheDocument()
    expect(screen.getByLabelText(/Social security number/)).toBeEnabled()
    expect(updateResolver).not.toHaveBeenCalled()
  })

  it('always shows the email field, independent of self-onboarding', async () => {
    renderWithProviders(<ProfileEditForm contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByDisplayValue('Ada')
    expect(screen.getByDisplayValue('ada.lovelace@example.com')).toBeInTheDocument()
  })

  it('blocks submission when a required field is cleared', async () => {
    const updateResolver = vi.fn<HttpResponseResolver>(() => HttpResponse.json(baseIndividual))
    server.use(handleUpdateContractor(updateResolver))

    const user = userEvent.setup()
    renderWithProviders(<ProfileEditForm contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByDisplayValue('Ada')
    await user.clear(screen.getByLabelText('First name'))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument()
    })
    expect(updateResolver).not.toHaveBeenCalled()
    expect(onEvent).not.toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_PROFILE_UPDATED,
      expect.anything(),
    )
  })

  it('saves successfully, firing the updated event and showing a success alert', async () => {
    let requestBody: Record<string, unknown> | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      requestBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({ ...baseIndividual, last_name: 'Byron' })
    })
    server.use(handleUpdateContractor(updateResolver))

    const user = userEvent.setup()
    renderWithProviders(<ProfileEditForm contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByDisplayValue('Ada')
    await user.clear(screen.getByLabelText('Last name'))
    await user.type(screen.getByLabelText('Last name'), 'Byron')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(updateResolver).toHaveBeenCalledTimes(1)
    })
    expect(requestBody).toMatchObject({ last_name: 'Byron' })
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_PROFILE_UPDATED,
      expect.objectContaining({ lastName: 'Byron' }),
    )
    expect(await screen.findByText('Profile updated')).toBeInTheDocument()
  })

  it('fires CONTRACTOR_MANAGEMENT_PROFILE_EDIT_CANCELLED when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProfileEditForm contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByDisplayValue('Ada')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_PROFILE_EDIT_CANCELLED,
    )
  })
})

describe('ProfileEditForm — business contractor', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
    mockContractor(baseBusiness)
  })

  it('renders business name and a locked EIN field, hiding individual fields', async () => {
    renderWithProviders(<ProfileEditForm contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByDisplayValue('Pacific Design Co.')

    expect(screen.getByDisplayValue('••-•••••••')).toBeDisabled()
    expect(screen.getAllByText('Employer Identification Number (EIN)').length).toBeGreaterThan(0)
    expect(screen.queryByLabelText('First name')).not.toBeInTheDocument()
  })
})
