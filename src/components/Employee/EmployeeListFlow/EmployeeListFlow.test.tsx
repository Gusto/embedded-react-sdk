import { beforeEach, describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmployeeListFlow } from './EmployeeListFlow'
import { server } from '@/test/mocks/server'
import { GustoProvider } from '@/contexts'
import { API_BASE_URL } from '@/test/constants'
import {
  createEmployee,
  getCompanyEmployees,
  getEmployee,
  getEmployeeOnboardingStatus,
} from '@/test/mocks/apis/employees'
import { getCompany } from '@/test/mocks/apis/company'
import { getCompanyLocations } from '@/test/mocks/apis/company_locations'
import { getEmployeeWorkAddresses } from '@/test/mocks/apis/employee_work_addresses'
import { getEmployeeHomeAddresses } from '@/test/mocks/apis/employee_home_addresses'

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
})
