import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Profile } from './Profile'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { API_BASE_URL } from '@/test/constants'
import { fillDate } from '@/test/reactAriaUserEvent'
import { basicLocation } from '@/test/mocks/apis/company_locations'
import {
  handleGetEmployee,
  handleCreateEmployee,
  handleUpdateEmployee,
  handleUpdateEmployeeOnboardingStatus,
} from '@/test/mocks/apis/employees'

const baseEmployee = {
  uuid: '4b3f930f-82cd-48a8-b797-798686e12e5e',
  first_name: 'Isom',
  middle_initial: 'J',
  last_name: 'Jaskolski',
  email: 'dane@botsford.net',
  company_uuid: 'a007e1ab-3595-43c2-ab4b-af7a5af2e365',
  version: '1c7ba9d62c8bafbfff998ffccad5d296',
  terminated: false,
  two_percent_shareholder: false,
  onboarded: false,
  onboarding_status: 'admin_onboarding_incomplete',
  jobs: [
    {
      uuid: '428a653a-0745-4db4-9c80-558288d416fa',
      version: '6c0ed1521e8b86eb36bd4455a63a2dac',
      employee_uuid: '4b3f930f-82cd-48a8-b797-798686e12e5e',
      current_compensation_uuid: 'c9fd719b-8b07-48f3-8a4c-f447d2c59669',
      payment_unit: 'Year',
      primary: true,
      title: 'Client Support Director',
      compensations: [],
      rate: '70000.00',
      hire_date: '2020-01-20',
    },
  ],
  date_of_birth: '1986-06-25',
  has_ssn: false,
  ssn: '',
  phone: '1234567890',
  preferred_first_name: 'Angel',
  work_email: 'angel@example.com',
  terminations: [],
  custom_fields: [],
  garnishments: [],
  eligible_paid_time_off: [],
}

const baseHomeAddress = {
  uuid: 'd9f74049-8769-4fba-8e0f-eceef2da4e6b',
  employee_uuid: '4b3f930f-82cd-48a8-b797-798686e12e5e',
  street_1: '100 5th Ave',
  street_2: 'Suite 555',
  city: 'New York',
  state: 'NY',
  zip: '10001',
  country: 'USA',
  active: true,
  effective_date: '2022-03-03',
  courtesy_withholding: false,
  version: '56a489ce86ed6c1b0f0cecc4050a0b01',
}

const baseWorkAddress = {
  uuid: 'be1c2e24-af86-4c36-b34e-3a55dbcdbdab',
  employee_uuid: '4b3f930f-82cd-48a8-b797-798686e12e5e',
  location_uuid: basicLocation.uuid,
  effective_date: '2023-01-01',
  active: true,
  version: 'bbe8d4c741339c6b9e0e2e1c1b120816',
  street_1: '123 Main St',
  street_2: 'Apt 101',
  city: 'Anytown',
  state: 'ABC',
  zip: '12345',
  country: 'USA',
}

const createEmployeeFixture = (overrides?: Record<string, unknown>) => ({
  ...baseEmployee,
  ...overrides,
})

const createHomeAddressFixture = (overrides?: Record<string, unknown>) => ({
  ...baseHomeAddress,
  ...overrides,
})

const COMPANY_ID = 'test-company-id'
const EMPLOYEE_ID = baseEmployee.uuid

function setupEmployeeHandlers({
  employee = baseEmployee,
  homeAddresses = [baseHomeAddress],
  workAddresses = [baseWorkAddress],
}: {
  employee?: Record<string, unknown>
  homeAddresses?: Record<string, unknown>[]
  workAddresses?: Record<string, unknown>[]
} = {}) {
  server.use(
    handleGetEmployee(() => HttpResponse.json(employee)),
    http.get(`${API_BASE_URL}/v1/employees/:employee_id/home_addresses`, () =>
      HttpResponse.json(homeAddresses),
    ),
    http.get(`${API_BASE_URL}/v1/home_addresses/:home_address_uuid`, ({ params }) => {
      const uuid = String(params.home_address_uuid)
      const row = homeAddresses.find(a => String(a.uuid) === uuid)
      if (!row) {
        return new HttpResponse(null, { status: 404 })
      }
      return HttpResponse.json(row)
    }),
    http.get(`${API_BASE_URL}/v1/employees/:employee_id/work_addresses`, () =>
      HttpResponse.json(workAddresses),
    ),
    http.get(`${API_BASE_URL}/v1/work_addresses/:work_address_uuid`, ({ params }) => {
      const uuid = String(params.work_address_uuid)
      const row = workAddresses.find(a => String(a.uuid) === uuid)
      if (!row) {
        return new HttpResponse(null, { status: 404 })
      }
      return HttpResponse.json(row)
    }),
  )
}

async function waitForProfileToLoad() {
  await waitFor(() => {
    expect(screen.getByText('Basics')).toBeInTheDocument()
  })
}

describe('Employee Profile', () => {
  const user = userEvent.setup()
  const mockOnEvent = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    setupApiTestMocks()
  })

  // -------------------------------------------------------------------
  // 1. Rendering and field presence
  // -------------------------------------------------------------------
  describe('Rendering and field presence', () => {
    it('renders all admin fields when creating a new employee', async () => {
      renderWithProviders(<Profile companyId={COMPANY_ID} isAdmin onEvent={mockOnEvent} />)

      await waitForProfileToLoad()

      expect(screen.getByLabelText(/Legal first name/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Middle initial/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Legal last name/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Work address/ })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: /Start date/ })).toBeInTheDocument()
      expect(screen.getByLabelText(/Personal email/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Social Security Number/)).toBeInTheDocument()
      expect(screen.getByRole('group', { name: /Date of birth/ })).toBeInTheDocument()
      expect(screen.getByLabelText(/Street 1/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Street 2/)).toBeInTheDocument()
      expect(screen.getByLabelText(/City/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /State/ })).toBeInTheDocument()
      expect(screen.getByLabelText(/Zip/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Include courtesy withholding/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Continue/ })).toBeInTheDocument()
    })

    it('pre-fills fields from existing employee data', async () => {
      setupEmployeeHandlers()

      renderWithProviders(
        <Profile companyId={COMPANY_ID} employeeId={EMPLOYEE_ID} isAdmin onEvent={mockOnEvent} />,
      )

      await waitForProfileToLoad()

      expect(screen.getByLabelText(/Legal first name/)).toHaveValue('Isom')
      expect(screen.getByLabelText(/Middle initial/)).toHaveValue('J')
      expect(screen.getByLabelText(/Legal last name/)).toHaveValue('Jaskolski')
      expect(screen.getByLabelText(/Personal email/)).toHaveValue('dane@botsford.net')
      expect(screen.getByLabelText(/Street 1/)).toHaveValue('100 5th Ave')
      expect(screen.getByLabelText(/Street 2/)).toHaveValue('Suite 555')
      expect(screen.getByLabelText(/City/)).toHaveValue('New York')
      expect(screen.getByLabelText(/Zip/)).toHaveValue('10001')
    })

    it('renders self-onboarding fields and hides admin-only fields when isAdmin=false', async () => {
      setupEmployeeHandlers()

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin={false}
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      expect(screen.getByLabelText(/Legal first name/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Legal last name/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Social Security Number/)).toBeInTheDocument()
      expect(screen.getByRole('group', { name: /Date of birth/ })).toBeInTheDocument()
      expect(screen.getByLabelText(/Street 1/)).toBeInTheDocument()

      expect(screen.queryByRole('button', { name: /Work address/ })).not.toBeInTheDocument()
      expect(screen.queryByRole('group', { name: /Start date/ })).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/Personal email/)).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/Include courtesy withholding/)).not.toBeInTheDocument()
      expect(
        screen.queryByLabelText(/Invite this employee to enter their own details/),
      ).not.toBeInTheDocument()
    })

    it('shows read-only work address for self-onboarding employee', async () => {
      setupEmployeeHandlers()

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin={false}
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      expect(screen.getByText('Work Address')).toBeInTheDocument()
    })

    it('hides work address section when self employee has no active work address', async () => {
      setupEmployeeHandlers({
        workAddresses: [{ ...baseWorkAddress, active: false }],
      })

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin={false}
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      expect(screen.queryByText('Work Address')).not.toBeInTheDocument()
    })

    it('shows courtesy withholding alert when checkbox is checked', async () => {
      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          onboarding_status: 'admin_onboarding_incomplete',
        }),
      })

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled={false}
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()

      await user.click(screen.getByLabelText(/Include courtesy withholding/))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })
  })

  // -------------------------------------------------------------------
  // 2. Self-onboarding toggle behavior
  // -------------------------------------------------------------------
  describe('Self-onboarding toggle behavior', () => {
    it('shows switch when isSelfOnboardingEnabled=true and onboarding is incomplete', async () => {
      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          onboarding_status: 'admin_onboarding_incomplete',
        }),
      })

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      expect(
        screen.getByLabelText(/Invite this employee to enter their own details/),
      ).toBeInTheDocument()
    })

    it('hides switch when isSelfOnboardingEnabled=false', async () => {
      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          onboarding_status: 'admin_onboarding_incomplete',
        }),
      })

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled={false}
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      expect(
        screen.queryByLabelText(/Invite this employee to enter their own details/),
      ).not.toBeInTheDocument()
    })

    it('hides switch when self-onboarding has been completed', async () => {
      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          onboarding_status: 'onboarding_completed',
        }),
      })

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      expect(
        screen.queryByLabelText(/Invite this employee to enter their own details/),
      ).not.toBeInTheDocument()
    })

    it('hides SSN, DOB, and home address when self-onboarding is toggled ON', async () => {
      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          onboarding_status: 'admin_onboarding_incomplete',
        }),
      })

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      const selfOnboardingSwitch = screen.getByLabelText(
        /Invite this employee to enter their own details/,
      )
      await user.click(selfOnboardingSwitch)

      await waitFor(() => {
        expect(screen.queryByLabelText(/Social Security Number/)).not.toBeInTheDocument()
      })
      expect(screen.queryByRole('group', { name: /Date of birth/ })).not.toBeInTheDocument()
      expect(screen.queryByText('Home address')).not.toBeInTheDocument()
    })

    it('shows SSN, DOB, and home address when self-onboarding is toggled OFF', async () => {
      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          onboarding_status: 'admin_onboarding_incomplete',
        }),
      })

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      const selfOnboardingSwitch = screen.getByLabelText(
        /Invite this employee to enter their own details/,
      )

      // Toggle ON then OFF
      await user.click(selfOnboardingSwitch)
      await waitFor(() => {
        expect(screen.queryByLabelText(/Social Security Number/)).not.toBeInTheDocument()
      })

      await user.click(selfOnboardingSwitch)
      await waitFor(() => {
        expect(screen.getByLabelText(/Social Security Number/)).toBeInTheDocument()
      })
      expect(screen.getByRole('group', { name: /Date of birth/ })).toBeInTheDocument()
      expect(screen.getByText('Home address')).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------
  // 3. Onboarding status conditionals
  // -------------------------------------------------------------------
  describe('Onboarding status conditionals', () => {
    it('admin_onboarding_incomplete: shows SSN gate, switch, and full form', async () => {
      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          onboarding_status: 'admin_onboarding_incomplete',
          has_ssn: false,
        }),
      })

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      expect(screen.getByLabelText(/Social Security Number/)).toBeInTheDocument()
      expect(
        screen.getByLabelText(/Invite this employee to enter their own details/),
      ).toBeInTheDocument()
    })

    it('self_onboarding_pending_invite: self-onboarding defaults to checked, hides SSN/DOB/home address', async () => {
      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          onboarding_status: 'self_onboarding_pending_invite',
        }),
      })

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      expect(screen.getByLabelText(/Legal first name/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Personal email/)).toBeInTheDocument()
      expect(screen.queryByLabelText(/Social Security Number/)).not.toBeInTheDocument()
      expect(screen.queryByRole('group', { name: /Date of birth/ })).not.toBeInTheDocument()
      expect(screen.queryByText('Home address')).not.toBeInTheDocument()
    })

    it.each([
      'self_onboarding_invited',
      'self_onboarding_invited_started',
      'self_onboarding_invited_overdue',
    ])('%s: self-onboarding defaults to checked, hides SSN/DOB/home address', async status => {
      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          onboarding_status: status,
        }),
      })

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      expect(screen.getByLabelText(/Legal first name/)).toBeInTheDocument()
      expect(screen.queryByLabelText(/Social Security Number/)).not.toBeInTheDocument()
      expect(screen.queryByRole('group', { name: /Date of birth/ })).not.toBeInTheDocument()
      expect(screen.queryByText('Home address')).not.toBeInTheDocument()
    })

    it('self_onboarding_completed_by_employee: hides switch, shows SSN/DOB and home address', async () => {
      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          onboarding_status: 'self_onboarding_completed_by_employee',
        }),
      })

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      expect(
        screen.queryByLabelText(/Invite this employee to enter their own details/),
      ).not.toBeInTheDocument()
      expect(screen.getByText('Home address')).toBeInTheDocument()
    })

    it('self_onboarding_awaiting_admin_review: same as completed', async () => {
      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          onboarding_status: 'self_onboarding_awaiting_admin_review',
        }),
      })

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      expect(
        screen.queryByLabelText(/Invite this employee to enter their own details/),
      ).not.toBeInTheDocument()
      expect(screen.getByText('Home address')).toBeInTheDocument()
    })

    it('onboarding_completed: switch hidden, fully editable', async () => {
      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          onboarding_status: 'onboarding_completed',
        }),
      })

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      expect(
        screen.queryByLabelText(/Invite this employee to enter their own details/),
      ).not.toBeInTheDocument()
      expect(screen.getByText('Home address')).toBeInTheDocument()
      expect(screen.getByLabelText(/Legal first name/)).toBeInTheDocument()
    })

    it('onboarded: true: same behavior as onboarding_completed', async () => {
      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          onboarded: true,
          onboarding_status: 'onboarding_completed',
        }),
      })

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      expect(
        screen.queryByLabelText(/Invite this employee to enter their own details/),
      ).not.toBeInTheDocument()
      expect(screen.getByText('Home address')).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------
  // 4. Required field enforcement (validation)
  // -------------------------------------------------------------------
  describe('Required field enforcement', () => {
    it('shows errors for all admin required fields on empty submit', async () => {
      renderWithProviders(<Profile companyId={COMPANY_ID} isAdmin onEvent={mockOnEvent} />)

      await waitForProfileToLoad()

      await user.click(screen.getByRole('button', { name: /Continue/ }))

      await waitFor(() => {
        expect(screen.getByText('Please enter valid first name')).toBeInTheDocument()
      })
      expect(screen.getByText('Please enter valid last name')).toBeInTheDocument()
      expect(screen.getByText('Valid email is required')).toBeInTheDocument()
    })

    it('shows errors for self-onboarding required fields on empty submit', async () => {
      setupEmployeeHandlers({
        employee: createEmployeeFixture({ has_ssn: false }),
      })

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin={false}
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      await user.clear(screen.getByLabelText(/Legal first name/))
      await user.clear(screen.getByLabelText(/Legal last name/))
      await user.clear(screen.getByLabelText(/Street 1/))
      await user.clear(screen.getByLabelText(/City/))
      await user.clear(screen.getByLabelText(/Zip/))

      await user.click(screen.getByRole('button', { name: /Continue/ }))

      await waitFor(() => {
        expect(screen.getByText('Please enter valid first name')).toBeInTheDocument()
      })
      expect(screen.getByText('Please enter valid last name')).toBeInTheDocument()
      expect(screen.getByText('Street address is required')).toBeInTheDocument()
      expect(screen.getByText('Please provide valid city name')).toBeInTheDocument()
      expect(screen.getByText('Please provide valid zip code')).toBeInTheDocument()

      expect(screen.queryByText('Valid email is required')).not.toBeInTheDocument()
    })

    it('admin with self-onboarding checked: SSN, DOB, home address fields are not required', async () => {
      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          onboarding_status: 'admin_onboarding_incomplete',
          has_ssn: false,
          first_name: '',
          last_name: '',
        }),
      })

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      const selfOnboardingSwitch = screen.getByLabelText(
        /Invite this employee to enter their own details/,
      )
      await user.click(selfOnboardingSwitch)

      await waitFor(() => {
        expect(screen.queryByLabelText(/Social Security Number/)).not.toBeInTheDocument()
      })

      expect(screen.queryByText('Home address')).not.toBeInTheDocument()
    })

    it('optional fields do not trigger errors when empty', async () => {
      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          middle_initial: null,
          onboarding_status: 'admin_onboarding_incomplete',
        }),
        homeAddresses: [createHomeAddressFixture({ street_2: '' })],
      })

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled={false}
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      expect(screen.getByLabelText(/Middle initial/)).toHaveValue('')
      expect(screen.getByLabelText(/Street 2/)).toHaveValue('')

      await user.click(screen.getByRole('button', { name: /Continue/ }))

      await waitFor(() => {
        const middleInitialField = screen.getByLabelText(/Middle initial/)
        expect(middleInitialField.closest('[data-invalid]')).toBeNull()
      })
    })
  })

  // -------------------------------------------------------------------
  // 5. SSN enable/disable behavior
  // -------------------------------------------------------------------
  describe('SSN enable/disable behavior', () => {
    it('SSN field is present when employee has no SSN', async () => {
      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          has_ssn: false,
          onboarding_status: 'admin_onboarding_incomplete',
        }),
      })

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled={false}
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      expect(screen.getByLabelText(/Social Security Number/)).toBeInTheDocument()
    })

    it('SSN field is present with placeholder when employee has SSN', async () => {
      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          has_ssn: true,
          onboarding_status: 'admin_onboarding_incomplete',
        }),
      })

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled={false}
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      const ssnField = screen.getByLabelText(/Social Security Number/)
      expect(ssnField).toBeInTheDocument()
      expect(ssnField).toHaveAttribute('placeholder', expect.stringMatching(/\*\*\*/))
    })

    it('toggling self-onboarding ON hides SSN field', async () => {
      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          has_ssn: false,
          onboarding_status: 'admin_onboarding_incomplete',
        }),
      })

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      expect(screen.getByLabelText(/Social Security Number/)).toBeInTheDocument()

      await user.click(screen.getByLabelText(/Invite this employee to enter their own details/))

      await waitFor(() => {
        expect(screen.queryByLabelText(/Social Security Number/)).not.toBeInTheDocument()
      })
    })

    it('existing employee with hasSsn=true: typing SSN enables validation and submits new value', async () => {
      const capturedUpdateEmployee = vi.fn()

      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          has_ssn: true,
          onboarding_status: 'admin_onboarding_incomplete',
        }),
      })

      server.use(
        handleUpdateEmployee(async ({ request }) => {
          const body = await request.json()
          capturedUpdateEmployee(body)
          const fixture = await import('@/test/mocks/fixtures/get-v1-employees.json')
          return HttpResponse.json({ ...fixture.default, version: 'updated-version' })
        }),
        http.put(`${API_BASE_URL}/v1/home_addresses/:home_address_uuid`, async () => {
          const fixture =
            await import('@/test/mocks/fixtures/get-v1-home_addresses-home_address_uuid.json')
          return HttpResponse.json(fixture.default)
        }),
        http.put(`${API_BASE_URL}/v1/work_addresses/:work_address_uuid`, async () => {
          const fixture =
            await import('@/test/mocks/fixtures/get-v1-work_addresses-work_address_uuid.json')
          return HttpResponse.json(fixture.default)
        }),
      )

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled={false}
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      const ssnField = screen.getByLabelText(/Social Security Number/)
      await user.type(ssnField, '234-56-7890')

      await fillDate({ date: { month: 5, day: 20, year: 2026 }, name: 'Start date', user })
      await user.click(screen.getByRole('button', { name: /Continue/ }))

      await waitFor(() => {
        expect(capturedUpdateEmployee).toHaveBeenCalledTimes(1)
      })

      expect(capturedUpdateEmployee).toHaveBeenCalledWith(
        expect.objectContaining({ ssn: '234567890' }),
      )
    })
  })

  // -------------------------------------------------------------------
  // 6. Form submission payloads (create flow)
  // -------------------------------------------------------------------
  describe('Form submission - create flow', () => {
    it('creates employee, home address, and work address with correct payloads', async () => {
      const capturedCreateEmployee = vi.fn()
      const capturedCreateHomeAddress = vi.fn()
      const capturedCreateWorkAddress = vi.fn()

      server.use(
        handleCreateEmployee(async ({ request }) => {
          capturedCreateEmployee(await request.json())
          const fixture = await import('@/test/mocks/fixtures/get-v1-employees.json')
          return HttpResponse.json(fixture.default, { status: 201 })
        }),
        http.post(
          `${API_BASE_URL}/v1/employees/:employee_id/home_addresses`,
          async ({ request }) => {
            const body = await request.json()
            capturedCreateHomeAddress(body)
            const fixture =
              await import('@/test/mocks/fixtures/get-v1-home_addresses-home_address_uuid.json')
            return HttpResponse.json(fixture.default, { status: 201 })
          },
        ),
        http.post(
          `${API_BASE_URL}/v1/employees/:employee_id/work_addresses`,
          async ({ request }) => {
            const body = await request.json()
            capturedCreateWorkAddress(body)
            const fixture =
              await import('@/test/mocks/fixtures/get-v1-work_addresses-work_address_uuid.json')
            return HttpResponse.json(fixture.default, { status: 201 })
          },
        ),
      )

      renderWithProviders(<Profile companyId={COMPANY_ID} isAdmin onEvent={mockOnEvent} />)

      await waitForProfileToLoad()

      await user.type(screen.getByLabelText(/Legal first name/), 'Jane')
      await user.type(screen.getByLabelText(/Legal last name/), 'Doe')
      await user.type(screen.getByLabelText(/Personal email/), 'jane@example.com')
      await user.type(screen.getByLabelText(/Social Security Number/), '123-45-6789')

      await user.click(screen.getByLabelText(/Work address/))
      await user.click(await screen.findByRole('option', { name: /123 Main St/ }))
      await fillDate({ date: { month: 3, day: 15, year: 2025 }, name: 'Start date', user })
      await fillDate({ date: { month: 6, day: 25, year: 1990 }, name: 'Date of birth', user })

      await user.type(screen.getByLabelText(/Street 1/), '456 Oak Ave')
      await user.type(screen.getByLabelText(/City/), 'Denver')
      await user.type(screen.getByLabelText(/Zip/), '80201')
      await user.click(screen.getByLabelText('State'))
      await user.click(await screen.findByRole('option', { name: 'Colorado' }))

      await user.click(screen.getByRole('button', { name: /Continue/ }))

      await waitFor(
        () => {
          expect(capturedCreateEmployee).toHaveBeenCalledTimes(1)
        },
        { timeout: 5000 },
      )

      expect(capturedCreateEmployee).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: 'Jane',
          last_name: 'Doe',
          email: 'jane@example.com',
          ssn: '123456789',
          date_of_birth: '1990-06-25',
        }),
      )

      await waitFor(() => {
        expect(capturedCreateHomeAddress).toHaveBeenCalledTimes(1)
      })

      expect(capturedCreateHomeAddress).toHaveBeenCalledWith(
        expect.objectContaining({
          street_1: '456 Oak Ave',
          city: 'Denver',
          state: 'CO',
          zip: '80201',
        }),
      )

      await waitFor(() => {
        expect(capturedCreateWorkAddress).toHaveBeenCalledTimes(1)
      })

      expect(capturedCreateWorkAddress).toHaveBeenCalledWith(
        expect.objectContaining({
          location_uuid: basicLocation.uuid,
          effective_date: '2025-03-15',
        }),
      )

      await waitFor(() => {
        expect(mockOnEvent).toHaveBeenCalledWith('employee/created', expect.anything())
      })

      expect(mockOnEvent).toHaveBeenCalledWith('employee/addresses/home/created', expect.anything())
      expect(mockOnEvent).toHaveBeenCalledWith('employee/addresses/work/created', expect.anything())
      expect(mockOnEvent).toHaveBeenCalledWith('employee/profile/done', expect.anything())
    })
  })

  // -------------------------------------------------------------------
  // 7. Form submission payloads (update flow)
  // -------------------------------------------------------------------
  describe('Form submission - update flow', () => {
    it('updates employee, home address, and work address with version fields', async () => {
      const capturedUpdateEmployee = vi.fn()
      const capturedUpdateHomeAddress = vi.fn()
      const capturedUpdateWorkAddress = vi.fn()

      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          onboarding_status: 'admin_onboarding_incomplete',
          has_ssn: true,
        }),
      })

      server.use(
        handleUpdateEmployee(async ({ request }) => {
          capturedUpdateEmployee(await request.json())
          const fixture = await import('@/test/mocks/fixtures/get-v1-employees.json')
          return HttpResponse.json({ ...fixture.default, version: 'updated-version' })
        }),
        http.put(`${API_BASE_URL}/v1/home_addresses/:home_address_uuid`, async ({ request }) => {
          capturedUpdateHomeAddress(await request.json())
          const fixture =
            await import('@/test/mocks/fixtures/get-v1-home_addresses-home_address_uuid.json')
          return HttpResponse.json(fixture.default)
        }),
        http.put(`${API_BASE_URL}/v1/work_addresses/:work_address_uuid`, async ({ request }) => {
          capturedUpdateWorkAddress(await request.json())
          const fixture =
            await import('@/test/mocks/fixtures/get-v1-work_addresses-work_address_uuid.json')
          return HttpResponse.json(fixture.default)
        }),
      )

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled={false}
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      const firstNameField = screen.getByLabelText(/Legal first name/)
      await user.clear(firstNameField)
      await user.type(firstNameField, 'Updated')

      await fillDate({ date: { month: 5, day: 20, year: 2026 }, name: 'Start date', user })
      await user.click(screen.getByRole('button', { name: /Continue/ }))

      await waitFor(() => {
        expect(capturedUpdateEmployee).toHaveBeenCalledTimes(1)
      })

      expect(capturedUpdateEmployee).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: 'Updated',
          version: baseEmployee.version,
        }),
      )

      await waitFor(() => {
        expect(capturedUpdateHomeAddress).toHaveBeenCalledTimes(1)
      })

      expect(capturedUpdateHomeAddress).toHaveBeenCalledWith(
        expect.objectContaining({
          version: baseHomeAddress.version,
        }),
      )

      await waitFor(() => {
        expect(capturedUpdateWorkAddress).toHaveBeenCalledTimes(1)
      })

      expect(capturedUpdateWorkAddress).toHaveBeenCalledWith(
        expect.objectContaining({
          version: baseWorkAddress.version,
          location_uuid: basicLocation.uuid,
        }),
      )

      await waitFor(() => {
        expect(mockOnEvent).toHaveBeenCalledWith('employee/updated', expect.anything())
      })
      expect(mockOnEvent).toHaveBeenCalledWith('employee/addresses/home/updated', expect.anything())
      expect(mockOnEvent).toHaveBeenCalledWith('employee/addresses/work/updated', expect.anything())
      expect(mockOnEvent).toHaveBeenCalledWith('employee/profile/done', expect.anything())
    })

    it('includes courtesyWithholding in home address update payload', async () => {
      const capturedUpdateHomeAddress = vi.fn()

      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          onboarding_status: 'admin_onboarding_incomplete',
          has_ssn: true,
        }),
        homeAddresses: [createHomeAddressFixture({ courtesy_withholding: false })],
      })

      server.use(
        handleUpdateEmployee(async () => {
          const fixture = await import('@/test/mocks/fixtures/get-v1-employees.json')
          return HttpResponse.json({ ...fixture.default, version: 'updated-version' })
        }),
        http.put(`${API_BASE_URL}/v1/home_addresses/:home_address_uuid`, async ({ request }) => {
          const body = await request.json()
          capturedUpdateHomeAddress(body)
          const fixture =
            await import('@/test/mocks/fixtures/get-v1-home_addresses-home_address_uuid.json')
          return HttpResponse.json(fixture.default)
        }),
        http.put(`${API_BASE_URL}/v1/work_addresses/:work_address_uuid`, async () => {
          const fixture =
            await import('@/test/mocks/fixtures/get-v1-work_addresses-work_address_uuid.json')
          return HttpResponse.json(fixture.default)
        }),
      )

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled={false}
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      await user.click(screen.getByLabelText(/Include courtesy withholding/))
      await fillDate({ date: { month: 5, day: 20, year: 2026 }, name: 'Start date', user })
      await user.click(screen.getByRole('button', { name: /Continue/ }))

      await waitFor(() => {
        expect(capturedUpdateHomeAddress).toHaveBeenCalledTimes(1)
      })

      expect(capturedUpdateHomeAddress).toHaveBeenCalledWith(
        expect.objectContaining({
          courtesy_withholding: true,
        }),
      )
    })

    it('does not send effective_date in work address update payload', async () => {
      const capturedUpdateWorkAddress = vi.fn()

      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          onboarding_status: 'admin_onboarding_incomplete',
          has_ssn: true,
        }),
      })

      server.use(
        handleUpdateEmployee(async () => {
          const fixture = await import('@/test/mocks/fixtures/get-v1-employees.json')
          return HttpResponse.json({ ...fixture.default, version: 'updated-version' })
        }),
        http.put(`${API_BASE_URL}/v1/home_addresses/:home_address_uuid`, async () => {
          const fixture =
            await import('@/test/mocks/fixtures/get-v1-home_addresses-home_address_uuid.json')
          return HttpResponse.json(fixture.default)
        }),
        http.put(`${API_BASE_URL}/v1/work_addresses/:work_address_uuid`, async ({ request }) => {
          capturedUpdateWorkAddress(await request.json())
          const fixture =
            await import('@/test/mocks/fixtures/get-v1-work_addresses-work_address_uuid.json')
          return HttpResponse.json(fixture.default)
        }),
      )

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled={false}
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      await fillDate({ date: { month: 5, day: 20, year: 2026 }, name: 'Start date', user })
      await user.click(screen.getByRole('button', { name: /Continue/ }))

      await waitFor(() => {
        expect(capturedUpdateWorkAddress).toHaveBeenCalledTimes(1)
      })

      const body = capturedUpdateWorkAddress.mock.calls[0]?.[0] as Record<string, unknown>
      expect(body).not.toHaveProperty('effective_date')
    })

    it('renders Start date empty in update mode when employee has no jobs (does not fall back to work address effective_date)', async () => {
      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          onboarding_status: 'admin_onboarding_incomplete',
          jobs: [],
        }),
        workAddresses: [
          {
            ...baseWorkAddress,
            effective_date: '1970-01-01',
          },
        ],
      })

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled={false}
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      const startDateGroup = screen.getByRole('group', { name: /Start date/ })
      const monthSpinbutton = within(startDateGroup).getByRole('spinbutton', { name: /month/i })

      expect(monthSpinbutton).not.toHaveAttribute('aria-valuenow')
    })

    it('pre-fills Start date from employee.jobs[0].hireDate in update mode', async () => {
      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          onboarding_status: 'admin_onboarding_incomplete',
          jobs: [
            {
              ...baseEmployee.jobs[0],
              hire_date: '2024-03-15',
            },
          ],
        }),
      })

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled={false}
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      const startDateGroup = screen.getByRole('group', { name: /Start date/ })
      const monthSpinbutton = within(startDateGroup).getByRole('spinbutton', { name: /month/i })
      const daySpinbutton = within(startDateGroup).getByRole('spinbutton', { name: /day/i })
      const yearSpinbutton = within(startDateGroup).getByRole('spinbutton', { name: /year/i })

      expect(monthSpinbutton).toHaveAttribute('aria-valuenow', '3')
      expect(daySpinbutton).toHaveAttribute('aria-valuenow', '15')
      expect(yearSpinbutton).toHaveAttribute('aria-valuenow', '2024')
    })

    it('allows submit in update mode without re-entering Start date when jobs[0].hireDate is set', async () => {
      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          onboarding_status: 'admin_onboarding_incomplete',
          has_ssn: true,
          jobs: [
            {
              ...baseEmployee.jobs[0],
              hire_date: '2024-03-15',
            },
          ],
        }),
      })

      server.use(
        handleUpdateEmployee(async () => {
          const fixture = await import('@/test/mocks/fixtures/get-v1-employees.json')
          return HttpResponse.json({ ...fixture.default, version: 'updated-version' })
        }),
        http.put(`${API_BASE_URL}/v1/home_addresses/:home_address_uuid`, async () => {
          const fixture =
            await import('@/test/mocks/fixtures/get-v1-home_addresses-home_address_uuid.json')
          return HttpResponse.json(fixture.default)
        }),
        http.put(`${API_BASE_URL}/v1/work_addresses/:work_address_uuid`, async () => {
          const fixture =
            await import('@/test/mocks/fixtures/get-v1-work_addresses-work_address_uuid.json')
          return HttpResponse.json(fixture.default)
        }),
      )

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled={false}
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      await user.click(screen.getByRole('button', { name: /Continue/ }))

      await waitFor(() => {
        expect(mockOnEvent).toHaveBeenCalledWith(
          'employee/profile/done',
          expect.objectContaining({ startDate: '2024-03-15' }),
        )
      })
    })

    it('EMPLOYEE_PROFILE_DONE event includes startDate', async () => {
      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          onboarding_status: 'admin_onboarding_incomplete',
          has_ssn: true,
        }),
      })

      server.use(
        handleUpdateEmployee(async () => {
          const fixture = await import('@/test/mocks/fixtures/get-v1-employees.json')
          return HttpResponse.json({ ...fixture.default, version: 'updated-version' })
        }),
        http.put(`${API_BASE_URL}/v1/home_addresses/:home_address_uuid`, async () => {
          const fixture =
            await import('@/test/mocks/fixtures/get-v1-home_addresses-home_address_uuid.json')
          return HttpResponse.json(fixture.default)
        }),
        http.put(`${API_BASE_URL}/v1/work_addresses/:work_address_uuid`, async () => {
          const fixture =
            await import('@/test/mocks/fixtures/get-v1-work_addresses-work_address_uuid.json')
          return HttpResponse.json(fixture.default)
        }),
      )

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled={false}
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      await fillDate({ date: { month: 5, day: 20, year: 2026 }, name: 'Start date', user })
      await user.click(screen.getByRole('button', { name: /Continue/ }))

      await waitFor(() => {
        expect(mockOnEvent).toHaveBeenCalledWith(
          'employee/profile/done',
          expect.objectContaining({ startDate: expect.anything() }),
        )
      })
    })
  })

  // -------------------------------------------------------------------
  // 8. Onboarding status update during submission
  // -------------------------------------------------------------------
  describe('Onboarding status update during submission', () => {
    it('flipping self-onboarding ON triggers status update to self_onboarding_pending_invite', async () => {
      const capturedStatusUpdate = vi.fn()

      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          onboarding_status: 'admin_onboarding_incomplete',
        }),
      })

      server.use(
        handleUpdateEmployeeOnboardingStatus(async ({ request }) => {
          const body = await request.json()
          capturedStatusUpdate(body)
          return HttpResponse.json({
            uuid: EMPLOYEE_ID,
            onboarding_status: 'self_onboarding_pending_invite',
          })
        }),
        handleUpdateEmployee(() =>
          HttpResponse.json({
            ...baseEmployee,
            onboarding_status: 'self_onboarding_pending_invite',
            version: 'updated-version',
          }),
        ),
        http.post(`${API_BASE_URL}/v1/employees/:employee_id/work_addresses`, () =>
          HttpResponse.json(baseWorkAddress, { status: 201 }),
        ),
      )

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      await user.click(screen.getByLabelText(/Invite this employee to enter their own details/))

      await waitFor(() => {
        expect(screen.queryByLabelText(/Social Security Number/)).not.toBeInTheDocument()
      })

      await fillDate({ date: { month: 5, day: 20, year: 2026 }, name: 'Start date', user })
      await user.click(screen.getByRole('button', { name: /Continue/ }))

      await waitFor(() => {
        expect(capturedStatusUpdate).toHaveBeenCalledTimes(1)
      })

      expect(capturedStatusUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          onboarding_status: 'self_onboarding_pending_invite',
        }),
      )

      await waitFor(() => {
        expect(mockOnEvent).toHaveBeenCalledWith(
          'employee/onboardingStatus/updated',
          expect.anything(),
        )
      })
    })

    it('flipping self-onboarding OFF triggers status update to admin_onboarding_incomplete', async () => {
      const capturedStatusUpdate = vi.fn()

      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          onboarding_status: 'self_onboarding_pending_invite',
          has_ssn: false,
        }),
      })

      server.use(
        handleUpdateEmployeeOnboardingStatus(async ({ request }) => {
          const body = await request.json()
          capturedStatusUpdate(body)
          return HttpResponse.json({
            uuid: EMPLOYEE_ID,
            onboarding_status: 'admin_onboarding_incomplete',
          })
        }),
        handleUpdateEmployee(() =>
          HttpResponse.json({
            ...baseEmployee,
            onboarding_status: 'admin_onboarding_incomplete',
            version: 'updated-version',
          }),
        ),
        http.put(`${API_BASE_URL}/v1/home_addresses/:home_address_uuid`, () =>
          HttpResponse.json(baseHomeAddress),
        ),
        http.put(`${API_BASE_URL}/v1/work_addresses/:work_address_uuid`, () =>
          HttpResponse.json(baseWorkAddress),
        ),
      )

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      const selfOnboardingSwitch = screen.getByLabelText(
        /Invite this employee to enter their own details/,
      )

      // Toggle it OFF
      await user.click(selfOnboardingSwitch)

      await waitFor(() => {
        expect(screen.getByLabelText(/Social Security Number/)).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/Social Security Number/), '123-45-6789')

      await fillDate({ date: { month: 5, day: 20, year: 2026 }, name: 'Start date', user })
      await user.click(screen.getByRole('button', { name: /Continue/ }))

      await waitFor(() => {
        expect(capturedStatusUpdate).toHaveBeenCalledTimes(1)
      })

      expect(capturedStatusUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          onboarding_status: 'admin_onboarding_incomplete',
        }),
      )
    })
  })

  // -------------------------------------------------------------------
  // 9. Home address skip logic during submission
  // -------------------------------------------------------------------
  describe('Home address skip logic during submission', () => {
    it('admin + self-onboarding checked + not completed: home address API NOT called', async () => {
      const capturedCreateHomeAddress = vi.fn()

      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          onboarding_status: 'admin_onboarding_incomplete',
        }),
        homeAddresses: [],
      })

      server.use(
        handleUpdateEmployeeOnboardingStatus(() =>
          HttpResponse.json({
            uuid: EMPLOYEE_ID,
            onboarding_status: 'self_onboarding_pending_invite',
          }),
        ),
        handleUpdateEmployee(() =>
          HttpResponse.json({
            ...baseEmployee,
            version: 'updated-version',
          }),
        ),
        http.post(
          `${API_BASE_URL}/v1/employees/:employee_id/home_addresses`,
          async ({ request }) => {
            const body = await request.json()
            capturedCreateHomeAddress(body)
            return HttpResponse.json(baseHomeAddress, { status: 201 })
          },
        ),
        http.put(`${API_BASE_URL}/v1/work_addresses/:work_address_uuid`, () =>
          HttpResponse.json(baseWorkAddress),
        ),
      )

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      await user.click(screen.getByLabelText(/Invite this employee to enter their own details/))

      await waitFor(() => {
        expect(screen.queryByText('Home address')).not.toBeInTheDocument()
      })

      await fillDate({ date: { month: 5, day: 20, year: 2026 }, name: 'Start date', user })
      await user.click(screen.getByRole('button', { name: /Continue/ }))

      await waitFor(() => {
        expect(mockOnEvent).toHaveBeenCalledWith('employee/profile/done', expect.anything())
      })

      expect(capturedCreateHomeAddress).not.toHaveBeenCalled()
    })

    it('self (not admin): home address API always called', async () => {
      const capturedUpdateHomeAddress = vi.fn()

      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          has_ssn: true,
          onboarding_status: 'admin_onboarding_incomplete',
        }),
      })

      server.use(
        handleUpdateEmployee(() =>
          HttpResponse.json({
            ...baseEmployee,
            version: 'updated-version',
          }),
        ),
        http.put(`${API_BASE_URL}/v1/home_addresses/:home_address_uuid`, async ({ request }) => {
          const body = await request.json()
          capturedUpdateHomeAddress(body)
          return HttpResponse.json(baseHomeAddress)
        }),
      )

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin={false}
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      await user.click(screen.getByRole('button', { name: /Continue/ }))

      await waitFor(() => {
        expect(capturedUpdateHomeAddress).toHaveBeenCalledTimes(1)
      })
    })

    it('self (not admin): work address API NOT called', async () => {
      const capturedCreateWorkAddress = vi.fn()
      const capturedUpdateWorkAddress = vi.fn()

      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          has_ssn: true,
          onboarding_status: 'admin_onboarding_incomplete',
        }),
      })

      server.use(
        handleUpdateEmployee(() =>
          HttpResponse.json({
            ...baseEmployee,
            version: 'updated-version',
          }),
        ),
        http.put(`${API_BASE_URL}/v1/home_addresses/:home_address_uuid`, () =>
          HttpResponse.json(baseHomeAddress),
        ),
        http.post(
          `${API_BASE_URL}/v1/employees/:employee_id/work_addresses`,
          async ({ request }) => {
            const body = await request.json()
            capturedCreateWorkAddress(body)
            return HttpResponse.json(baseWorkAddress, { status: 201 })
          },
        ),
        http.put(`${API_BASE_URL}/v1/work_addresses/:work_address_uuid`, async ({ request }) => {
          const body = await request.json()
          capturedUpdateWorkAddress(body)
          return HttpResponse.json(baseWorkAddress)
        }),
      )

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin={false}
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      await user.click(screen.getByRole('button', { name: /Continue/ }))

      await waitFor(() => {
        expect(mockOnEvent).toHaveBeenCalledWith('employee/profile/done', expect.anything())
      })

      expect(capturedCreateWorkAddress).not.toHaveBeenCalled()
      expect(capturedUpdateWorkAddress).not.toHaveBeenCalled()
    })

    it('admin + self-onboarding checked + completed: home address API IS called', async () => {
      const capturedUpdateHomeAddress = vi.fn()

      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          onboarding_status: 'self_onboarding_completed_by_employee',
        }),
      })

      server.use(
        handleUpdateEmployee(() =>
          HttpResponse.json({
            ...baseEmployee,
            onboarding_status: 'self_onboarding_completed_by_employee',
            version: 'updated-version',
          }),
        ),
        http.put(`${API_BASE_URL}/v1/home_addresses/:home_address_uuid`, async ({ request }) => {
          const body = await request.json()
          capturedUpdateHomeAddress(body)
          return HttpResponse.json(baseHomeAddress)
        }),
        http.put(`${API_BASE_URL}/v1/work_addresses/:work_address_uuid`, () =>
          HttpResponse.json(baseWorkAddress),
        ),
      )

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      await fillDate({ date: { month: 5, day: 20, year: 2026 }, name: 'Start date', user })
      await user.click(screen.getByRole('button', { name: /Continue/ }))

      await waitFor(() => {
        expect(capturedUpdateHomeAddress).toHaveBeenCalledTimes(1)
      })
    })
  })

  // -------------------------------------------------------------------
  // 10. Default values
  // -------------------------------------------------------------------
  describe('Default values', () => {
    it('pre-fills from defaultValues.employee when no existing employee', async () => {
      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          isAdmin
          onEvent={mockOnEvent}
          defaultValues={{
            employee: {
              firstName: 'DefaultFirst',
              lastName: 'DefaultLast',
              email: 'default@email.com',
            },
          }}
        />,
      )

      await waitForProfileToLoad()

      expect(screen.getByLabelText(/Legal first name/)).toHaveValue('DefaultFirst')
      expect(screen.getByLabelText(/Legal last name/)).toHaveValue('DefaultLast')
      expect(screen.getByLabelText(/Personal email/)).toHaveValue('default@email.com')
    })

    it('pre-fills from defaultValues.homeAddress when no existing employee', async () => {
      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          isAdmin
          onEvent={mockOnEvent}
          defaultValues={{
            homeAddress: {
              street1: '789 Default St',
              city: 'DefaultCity',
              state: 'CA',
              zip: '90210',
            },
          }}
        />,
      )

      await waitForProfileToLoad()

      expect(screen.getByLabelText(/Street 1/)).toHaveValue('789 Default St')
      expect(screen.getByLabelText(/City/)).toHaveValue('DefaultCity')
      expect(screen.getByLabelText(/Zip/)).toHaveValue('90210')
    })

    it('existing employee data takes precedence over defaultValues', async () => {
      setupEmployeeHandlers()

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          onEvent={mockOnEvent}
          defaultValues={{
            employee: {
              firstName: 'ShouldNotAppear',
            },
          }}
        />,
      )

      await waitForProfileToLoad()

      expect(screen.getByLabelText(/Legal first name/)).toHaveValue('Isom')
    })

    it('inviteEmployeeDefault sets initial self-onboarding toggle state', async () => {
      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          isAdmin
          isSelfOnboardingEnabled
          onEvent={mockOnEvent}
          defaultValues={{
            inviteEmployeeDefault: true,
          }}
        />,
      )

      await waitForProfileToLoad()

      // When inviteEmployeeDefault is true and no employee exists,
      // the self-onboarding switch should be checked, hiding SSN/DOB/home address
      expect(screen.queryByLabelText(/Social Security Number/)).not.toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------
  // 11. Edge cases
  // -------------------------------------------------------------------
  describe('Edge cases', () => {
    it('renders empty form when no employeeId and no defaultValues', async () => {
      renderWithProviders(<Profile companyId={COMPANY_ID} isAdmin onEvent={mockOnEvent} />)

      await waitForProfileToLoad()

      expect(screen.getByLabelText(/Legal first name/)).toHaveValue('')
      expect(screen.getByLabelText(/Legal last name/)).toHaveValue('')
      expect(screen.getByLabelText(/Personal email/)).toHaveValue('')
      expect(screen.getByLabelText(/Street 1/)).toHaveValue('')
      expect(screen.getByLabelText(/City/)).toHaveValue('')
      expect(screen.getByLabelText(/Zip/)).toHaveValue('')
    })

    it('employee with hasSsn: true shows SSN placeholder', async () => {
      setupEmployeeHandlers({
        employee: createEmployeeFixture({
          has_ssn: true,
          onboarding_status: 'admin_onboarding_incomplete',
        }),
      })

      renderWithProviders(
        <Profile
          companyId={COMPANY_ID}
          employeeId={EMPLOYEE_ID}
          isAdmin
          isSelfOnboardingEnabled={false}
          onEvent={mockOnEvent}
        />,
      )

      await waitForProfileToLoad()

      const ssnField = screen.getByLabelText(/Social Security Number/)
      expect(ssnField).toHaveAttribute('placeholder', expect.stringContaining('***'))
    })

    it('selects active home address when multiple addresses exist', async () => {
      setupEmployeeHandlers({
        homeAddresses: [
          createHomeAddressFixture({
            uuid: 'inactive-uuid',
            active: false,
            street_1: '999 Old St',
          }),
          createHomeAddressFixture({
            uuid: 'active-uuid',
            active: true,
            street_1: '100 5th Ave',
          }),
        ],
      })

      renderWithProviders(
        <Profile companyId={COMPANY_ID} employeeId={EMPLOYEE_ID} isAdmin onEvent={mockOnEvent} />,
      )

      await waitForProfileToLoad()

      expect(screen.getByLabelText(/Street 1/)).toHaveValue('100 5th Ave')
    })
  })
})
