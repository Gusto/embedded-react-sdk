import { beforeEach, describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmployeeListFlow } from './EmployeeListFlow'
import { server } from '@/test/mocks/server'
import { GustoProvider } from '@/contexts'
import { API_BASE_URL } from '@/test/constants'
import {
  createEmployee,
  createEmployeeRehire,
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
      createEmployeeRehire,
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

  it('shows Edit and Rehire actions in the dismissed employee menu', async () => {
    const user = userEvent.setup()
    render(
      <GustoProvider config={{ baseUrl: API_BASE_URL }}>
        <EmployeeListFlow companyId="123" onEvent={() => {}} />
      </GustoProvider>,
    )

    await user.click(await screen.findByRole('tab', { name: /Dismissed/i }))
    await screen.findByText(/Maximus/i)

    await user.click(screen.getByRole('button', { name: 'Employee actions menu' }))

    expect(await screen.findByRole('menuitem', { name: 'Edit employee' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Rehire employee' })).toBeInTheDocument()
  })

  it('navigates to the employee dashboard when Edit is selected on a dismissed employee', async () => {
    const user = userEvent.setup()
    render(
      <GustoProvider config={{ baseUrl: API_BASE_URL }}>
        <EmployeeListFlow companyId="123" onEvent={() => {}} />
      </GustoProvider>,
    )

    await user.click(await screen.findByRole('tab', { name: /Dismissed/i }))
    await screen.findByText(/Maximus/i)

    await user.click(screen.getByRole('button', { name: 'Employee actions menu' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Edit employee' }))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Add/i })).not.toBeInTheDocument()
    })
    expect(await screen.findByText('Legal name')).toBeInTheDocument()
  })

  it('opens the rehire form when Rehire is selected on a dismissed employee', async () => {
    const user = userEvent.setup()
    render(
      <GustoProvider config={{ baseUrl: API_BASE_URL }}>
        <EmployeeListFlow companyId="123" onEvent={() => {}} />
      </GustoProvider>,
    )

    await user.click(await screen.findByRole('tab', { name: /Dismissed/i }))
    await screen.findByText(/Maximus/i)

    await user.click(screen.getByRole('button', { name: 'Employee actions menu' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Rehire employee' }))

    expect(await screen.findByRole('button', { name: 'Schedule rehire' })).toBeInTheDocument()
  })

  it('returns to the employee list after scheduling a rehire', async () => {
    const user = userEvent.setup()
    render(
      <GustoProvider config={{ baseUrl: API_BASE_URL }}>
        <EmployeeListFlow companyId="123" onEvent={() => {}} />
      </GustoProvider>,
    )

    await user.click(await screen.findByRole('tab', { name: /Dismissed/i }))
    await screen.findByText(/Maximus/i)

    await user.click(screen.getByRole('button', { name: 'Employee actions menu' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Rehire employee' }))

    await user.click(await screen.findByRole('button', { name: 'Schedule rehire' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add/i })).toBeInTheDocument()
    })
  })
})
