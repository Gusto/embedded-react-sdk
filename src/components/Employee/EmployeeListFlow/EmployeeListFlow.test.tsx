import { beforeEach, describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { EmployeeListFlow } from './EmployeeListFlow'
import { server } from '@/test/mocks/server'
import { GustoProvider } from '@/contexts'
import { API_BASE_URL } from '@/test/constants'
import {
  createEmployee,
  getCompanyEmployees,
  getEmployee,
  getEmployeeOnboardingStatus,
  handleGetCompanyEmployees,
} from '@/test/mocks/apis/employees'
import { getCompany } from '@/test/mocks/apis/company'
import { getCompanyLocations } from '@/test/mocks/apis/company_locations'
import { getEmployeeWorkAddresses } from '@/test/mocks/apis/employee_work_addresses'
import { getEmployeeHomeAddresses } from '@/test/mocks/apis/employee_home_addresses'
import { setupApiTestMocks } from '@/test/mocks/apiServer'

describe('EmployeeListFlow', () => {
  beforeEach(() => {
    server.use(
      getCompanyEmployees('123'),
      getEmployee,
      getCompany,
      getCompanyLocations,
      getEmployeeWorkAddresses,
      getEmployeeHomeAddresses,
      getEmployeeOnboardingStatus,
      createEmployee,
    )
  })

  it('renders the management list initially', async () => {
    render(
      <GustoProvider config={{ baseUrl: API_BASE_URL }}>
        <EmployeeListFlow companyId="123" onEvent={() => {}} />
      </GustoProvider>,
    )

    await screen.findByRole('button', { name: /Add/i })
    expect(await screen.findByText(/Maximus/i)).toBeInTheDocument()
  })

  it('lands on the Profile step when adding an employee — skips the redundant onboarding list', async () => {
    const user = userEvent.setup()
    render(
      <GustoProvider config={{ baseUrl: API_BASE_URL }}>
        <EmployeeListFlow companyId="123" onEvent={() => {}} />
      </GustoProvider>,
    )

    await user.click(await screen.findByRole('button', { name: /Add/i }))

    await screen.findByLabelText(/social/i)
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
  })

  it('hides the self-onboarding toggle on the Profile step when isSelfOnboardingEnabled is false', async () => {
    const user = userEvent.setup()
    render(
      <GustoProvider config={{ baseUrl: API_BASE_URL }}>
        <EmployeeListFlow companyId="123" isSelfOnboardingEnabled={false} onEvent={() => {}} />
      </GustoProvider>,
    )

    await user.click(await screen.findByRole('button', { name: /Add/i }))

    await screen.findByLabelText(/social/i)
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(
      screen.queryByLabelText(/Invite this employee to enter their own details/),
    ).not.toBeInTheDocument()
  })

  it('opens the profile of an employee still onboarding, and a blank profile for a new employee afterward', async () => {
    setupApiTestMocks()
    server.use(
      handleGetCompanyEmployees(() =>
        HttpResponse.json([
          {
            uuid: '4b3f930f-82cd-48a8-b797-798686e12e5e',
            first_name: 'Isom',
            last_name: 'Jaskolski',
            onboarded: false,
            onboarding_status: 'admin_onboarding_incomplete',
          },
        ]),
      ),
    )
    const user = userEvent.setup()

    render(
      <GustoProvider config={{ baseUrl: API_BASE_URL }}>
        <EmployeeListFlow companyId="123" onEvent={() => {}} />
      </GustoProvider>,
    )

    await user.click(await screen.findByRole('tab', { name: 'Onboarding' }))
    await user.click(await screen.findByRole('button', { name: 'Employee actions menu' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Continue onboarding' }))

    expect(await screen.findByDisplayValue('Isom')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back to employees' }))
    await user.click(await screen.findByRole('button', { name: /Add/i }))

    await screen.findByLabelText(/social/i)
    expect(screen.getByLabelText(/first name/i)).toHaveValue('')
  })
})
