import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { ContractorProfile } from './ContractorProfile'
import { server } from '@/test/mocks/server'
import {
  handleCreateContractor,
  handleGetContractor,
  handleUpdateContractor,
} from '@/test/mocks/apis/contractors'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { contractorEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

/**
 * Component-behavior regression net for the contractor profile.
 *
 * Locks in the durable contract — conditional rendering, submit-time
 * validation blocking the mutation, redacted PII, and the emitted event
 * payloads — that must survive (and now runs against) the migration to
 * `useContractorDetailsForm`. The exhaustive schema-level validation matrix
 * lives alongside the hook in `contractorDetailsSchema.test.ts`.
 */

describe('Contractor profile component behavior', () => {
  describe('Layer B — component behavior', () => {
    beforeEach(() => {
      setupApiTestMocks()
    })

    const companyId = 'company-123'

    it('renders business + fixed defaults with no individual, hourly, or email fields', async () => {
      renderWithProviders(<ContractorProfile companyId={companyId} onEvent={vi.fn()} />)

      await screen.findByText('Contractor profile')

      expect(screen.getByLabelText('Business Name')).toBeInTheDocument()
      expect(screen.getByLabelText('EIN')).toBeInTheDocument()
      expect(screen.queryByLabelText('First Name')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Hourly Rate')).not.toBeInTheDocument()
      expect(screen.queryByLabelText("Contractor's email address")).not.toBeInTheDocument()
    })

    it('swaps to individual fields when the Individual type is selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ContractorProfile companyId={companyId} onEvent={vi.fn()} />)

      await screen.findByText('Contractor profile')
      await user.click(screen.getByRole('radio', { name: 'Individual' }))

      expect(screen.getByLabelText('First Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Social Security Number')).toBeInTheDocument()
      expect(screen.queryByLabelText('Business Name')).not.toBeInTheDocument()
    })

    it('reveals the hourly rate when the Hourly wage type is selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ContractorProfile companyId={companyId} onEvent={vi.fn()} />)

      await screen.findByText('Contractor profile')
      expect(screen.queryByLabelText('Hourly Rate')).not.toBeInTheDocument()

      await user.click(screen.getByRole('radio', { name: 'Hourly' }))

      expect(screen.getByLabelText('Hourly Rate')).toBeInTheDocument()
    })

    it('reveals email and hides SSN/EIN when self-onboarding is enabled', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ContractorProfile companyId={companyId} onEvent={vi.fn()} />)

      await screen.findByText('Contractor profile')
      await user.click(screen.getByRole('radio', { name: 'Individual' }))
      expect(screen.getByLabelText('Social Security Number')).toBeInTheDocument()

      await user.click(screen.getByRole('switch'))

      expect(screen.getByLabelText("Contractor's email address")).toBeInTheDocument()
      expect(screen.queryByLabelText('Social Security Number')).not.toBeInTheDocument()
    })

    it('blocks submission and surfaces errors when required individual fields are empty', async () => {
      const user = userEvent.setup()
      const createResolver = vi.fn<HttpResponseResolver>(() =>
        HttpResponse.json({ uuid: 'x' }, { status: 201 }),
      )
      server.use(handleCreateContractor(createResolver))

      renderWithProviders(<ContractorProfile companyId={companyId} onEvent={vi.fn()} />)

      await screen.findByText('Contractor profile')
      await user.click(screen.getByRole('radio', { name: 'Individual' }))
      await user.click(screen.getByRole('button', { name: 'Create Contractor' }))

      expect(
        await screen.findByText('First name is required for individual contractors'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Last name is required for individual contractors'),
      ).toBeInTheDocument()
      expect(screen.getByText('SSN is required for individual contractors')).toBeInTheDocument()
      expect(createResolver).not.toHaveBeenCalled()
    })

    it('blocks submission when SSN format is invalid', async () => {
      const user = userEvent.setup()
      const createResolver = vi.fn<HttpResponseResolver>(() =>
        HttpResponse.json({ uuid: 'x' }, { status: 201 }),
      )
      server.use(handleCreateContractor(createResolver))

      renderWithProviders(<ContractorProfile companyId={companyId} onEvent={vi.fn()} />)

      await screen.findByText('Contractor profile')
      await user.click(screen.getByRole('radio', { name: 'Individual' }))
      await user.type(screen.getByLabelText('First Name'), 'John')
      await user.type(screen.getByLabelText('Last Name'), 'Doe')
      await user.type(screen.getByLabelText('Social Security Number'), '123-45-678')
      await user.click(screen.getByRole('button', { name: 'Create Contractor' }))

      expect(await screen.findByText('SSN must be valid format')).toBeInTheDocument()
      expect(createResolver).not.toHaveBeenCalled()
    })

    it('blocks submission when business EIN format is invalid', async () => {
      const user = userEvent.setup()
      const createResolver = vi.fn<HttpResponseResolver>(() =>
        HttpResponse.json({ uuid: 'x' }, { status: 201 }),
      )
      server.use(handleCreateContractor(createResolver))

      renderWithProviders(<ContractorProfile companyId={companyId} onEvent={vi.fn()} />)

      await screen.findByText('Contractor profile')
      await user.type(screen.getByLabelText('Business Name'), 'Acme LLC')
      await user.type(screen.getByLabelText('EIN'), '12-345')
      await user.click(screen.getByRole('button', { name: 'Create Contractor' }))

      expect(await screen.findByText('EIN must be valid format (XX-XXXXXXX)')).toBeInTheDocument()
      expect(createResolver).not.toHaveBeenCalled()
    })

    it('emits create events with the contractor and selfOnboarding payload', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()
      const createResolver = vi.fn<HttpResponseResolver>(() =>
        HttpResponse.json(
          {
            uuid: 'new-contractor-uuid',
            type: 'Business',
            business_name: 'Acme LLC',
            is_active: true,
          },
          { status: 201 },
        ),
      )
      const updateResolver = vi.fn<HttpResponseResolver>(() => HttpResponse.json({}))
      server.use(handleCreateContractor(createResolver), handleUpdateContractor(updateResolver))

      renderWithProviders(<ContractorProfile companyId={companyId} onEvent={onEvent} />)

      await screen.findByText('Contractor profile')
      await user.type(screen.getByLabelText('Business Name'), 'Acme LLC')
      await user.type(screen.getByLabelText('EIN'), '12-3456789')
      await user.click(screen.getByRole('button', { name: 'Create Contractor' }))

      await waitFor(() => {
        expect(createResolver).toHaveBeenCalledTimes(1)
      })
      expect(updateResolver).not.toHaveBeenCalled()
      expect(onEvent).toHaveBeenCalledWith(
        contractorEvents.CONTRACTOR_CREATED,
        expect.objectContaining({ uuid: 'new-contractor-uuid' }),
      )
      expect(onEvent).toHaveBeenCalledWith(
        contractorEvents.CONTRACTOR_PROFILE_DONE,
        expect.objectContaining({ contractorId: 'new-contractor-uuid', selfOnboarding: false }),
      )
    })

    it('does not require re-entering SSN for an existing contractor with SSN on file', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()
      const updateResolver = vi.fn<HttpResponseResolver>(() =>
        HttpResponse.json({
          uuid: 'contractor_id',
          type: 'Individual',
          first_name: 'John',
          last_name: 'Doe',
          is_active: true,
          version: 'updated-version',
        }),
      )
      server.use(
        handleGetContractor(() =>
          HttpResponse.json({
            uuid: 'contractor_id',
            version: 'version-1',
            type: 'Individual',
            wage_type: 'Fixed',
            start_date: '2024-01-01',
            first_name: 'John',
            last_name: 'Doe',
            has_ssn: true,
            has_ein: false,
            is_active: true,
            file_new_hire_report: false,
            onboarding_status: 'admin_onboarding_incomplete',
          }),
        ),
        handleUpdateContractor(updateResolver),
      )

      renderWithProviders(
        <ContractorProfile companyId={companyId} contractorId="contractor_id" onEvent={onEvent} />,
      )

      await screen.findByText('Contractor profile')
      expect(screen.getByLabelText('First Name')).toHaveValue('John')

      await user.click(screen.getByRole('button', { name: 'Update Contractor' }))

      await waitFor(() => {
        expect(updateResolver).toHaveBeenCalledTimes(1)
      })
      expect(onEvent).toHaveBeenCalledWith(
        contractorEvents.CONTRACTOR_UPDATED,
        expect.objectContaining({ uuid: 'contractor_id' }),
      )
    })
  })

  describe('self-onboarding (isAdmin=false)', () => {
    beforeEach(() => {
      setupApiTestMocks()
    })

    const companyId = 'company-123'

    // Self-onboarding contractors were invited by email, so the GET always
    // includes one; the schema requires email while self_onboarding is true.
    const individualContractor = {
      uuid: 'contractor_id',
      version: 'version-1',
      type: 'Individual',
      wage_type: 'Fixed',
      start_date: '2024-01-01',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      has_ssn: false,
      has_ein: false,
      is_active: true,
      file_new_hire_report: false,
      onboarding_status: 'self_onboarding_invited',
    }

    const businessContractor = {
      uuid: 'contractor_id',
      version: 'version-1',
      type: 'Business',
      wage_type: 'Fixed',
      start_date: '2024-01-01',
      business_name: 'Acme LLC',
      email: 'billing@acme.com',
      has_ssn: false,
      has_ein: false,
      is_active: true,
      file_new_hire_report: false,
      onboarding_status: 'self_onboarding_invited',
    }

    it('renders the individual self-onboarding profile based on contractor type', async () => {
      server.use(handleGetContractor(() => HttpResponse.json(individualContractor)))

      renderWithProviders(
        <ContractorProfile
          companyId={companyId}
          contractorId="contractor_id"
          isAdmin={false}
          onEvent={vi.fn()}
        />,
      )

      await screen.findByText('Complete your profile')

      expect(screen.getByLabelText('First Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Social Security Number')).toBeInTheDocument()
      expect(screen.queryByLabelText('Business Name')).not.toBeInTheDocument()
      expect(screen.queryByRole('switch')).not.toBeInTheDocument()
    })

    it('submits the individual SSN and emits self-onboarding events', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()
      let body: Record<string, unknown> | null = null
      const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          ...individualContractor,
          version: 'updated-version',
        })
      })
      server.use(
        handleGetContractor(() => HttpResponse.json(individualContractor)),
        handleUpdateContractor(updateResolver),
      )

      renderWithProviders(
        <ContractorProfile
          companyId={companyId}
          contractorId="contractor_id"
          isAdmin={false}
          onEvent={onEvent}
        />,
      )

      await screen.findByText('Complete your profile')
      await user.type(screen.getByLabelText('Social Security Number'), '123-45-6789')
      await user.click(screen.getByRole('button', { name: 'Continue' }))

      await waitFor(() => {
        expect(updateResolver).toHaveBeenCalledTimes(1)
      })
      expect(body).toMatchObject({ ssn: '123456789', self_onboarding: true })
      expect(onEvent).toHaveBeenCalledWith(
        contractorEvents.CONTRACTOR_UPDATED,
        expect.objectContaining({ uuid: 'contractor_id' }),
      )
      expect(onEvent).toHaveBeenCalledWith(
        contractorEvents.CONTRACTOR_PROFILE_DONE,
        expect.objectContaining({ contractorId: 'contractor_id', selfOnboarding: true }),
      )
    })

    it('renders the business self-onboarding profile and submits the EIN', async () => {
      const user = userEvent.setup()
      let body: Record<string, unknown> | null = null
      const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ ...businessContractor, version: 'updated-version' })
      })
      server.use(
        handleGetContractor(() => HttpResponse.json(businessContractor)),
        handleUpdateContractor(updateResolver),
      )

      renderWithProviders(
        <ContractorProfile
          companyId={companyId}
          contractorId="contractor_id"
          isAdmin={false}
          onEvent={vi.fn()}
        />,
      )

      await screen.findByText('Complete your profile')
      expect(screen.getByLabelText('Business Name')).toBeInTheDocument()
      expect(screen.queryByLabelText('First Name')).not.toBeInTheDocument()

      await user.type(screen.getByLabelText('EIN'), '12-3456789')
      await user.click(screen.getByRole('button', { name: 'Continue' }))

      await waitFor(() => {
        expect(updateResolver).toHaveBeenCalledTimes(1)
      })
      expect(body).toMatchObject({ ein: '123456789', self_onboarding: true })
    })

    it('does not require re-entering SSN for an individual with SSN on file', async () => {
      const user = userEvent.setup()
      const updateResolver = vi.fn<HttpResponseResolver>(() =>
        HttpResponse.json({ ...individualContractor, version: 'updated-version' }),
      )
      server.use(
        handleGetContractor(() => HttpResponse.json({ ...individualContractor, has_ssn: true })),
        handleUpdateContractor(updateResolver),
      )

      renderWithProviders(
        <ContractorProfile
          companyId={companyId}
          contractorId="contractor_id"
          isAdmin={false}
          onEvent={vi.fn()}
        />,
      )

      await screen.findByText('Complete your profile')
      await user.click(screen.getByRole('button', { name: 'Continue' }))

      await waitFor(() => {
        expect(updateResolver).toHaveBeenCalledTimes(1)
      })
    })
  })
})
