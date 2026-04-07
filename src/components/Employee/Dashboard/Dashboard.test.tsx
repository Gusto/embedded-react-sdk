import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Dashboard } from './Dashboard'
import { server } from '@/test/mocks/server'
import { API_BASE_URL } from '@/test/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const mockEmployee = {
  uuid: 'employee-123',
  first_name: 'John',
  last_name: 'Doe',
  date_of_birth: '1990-01-15',
  ssn: '123-45-6789',
  email: 'john.doe@example.com',
  jobs: [
    {
      uuid: 'job-123',
      title: 'Software Engineer',
      hire_date: '2020-01-01',
      rate: '100000',
      payment_unit: 'Year',
    },
  ],
}

const mockHomeAddress = {
  uuid: 'home-address-123',
  street_1: '123 Main St',
  street_2: 'Apt 4B',
  city: 'San Francisco',
  state: 'CA',
  zip: '94102',
}

const mockWorkAddress = {
  uuid: 'work-address-123',
  street_1: '456 Office Blvd',
  city: 'San Francisco',
  state: 'CA',
  zip: '94103',
}

describe('Dashboard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    onEvent.mockClear()

    server.use(
      http.get(`${API_BASE_URL}/v1/employees/:employee_id`, () =>
        HttpResponse.json({ employee: mockEmployee }),
      ),
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/home_addresses`, () =>
        HttpResponse.json({ employee_address_list: [mockHomeAddress] }),
      ),
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/work_addresses`, () =>
        HttpResponse.json({ employee_work_addresses_list: [mockWorkAddress] }),
      ),
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/payment_method`, () =>
        HttpResponse.json({ employee_payment_method: null }),
      ),
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/bank_accounts`, () =>
        HttpResponse.json({ bank_accounts: [] }),
      ),
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/garnishments`, () =>
        HttpResponse.json({ garnishment_list: [] }),
      ),
      http.get(`${API_BASE_URL}/v1/employees/:employee_uuid/pay_stubs`, () =>
        HttpResponse.json({ employee_pay_stubs_list: [] }),
      ),
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/federal_taxes`, () =>
        HttpResponse.json({
          employee_federal_tax: {
            filing_status: 'Married',
            two_jobs: false,
            dependents_amount: '4000',
            other_income: '0',
            deductions: '0',
            extra_withholding: '0',
          },
        }),
      ),
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/state_taxes`, () =>
        HttpResponse.json({ employee_state_taxes_list: [] }),
      ),
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/forms`, () =>
        HttpResponse.json({ form_list: [] }),
      ),
    )
  })

  it('renders dashboard with title and tabs', async () => {
    renderWithProviders(
      <Dashboard companyId="company-123" employeeId="employee-123" onEvent={onEvent} />,
    )

    await waitFor(() => {
      expect(screen.getByText('Employee Dashboard')).toBeTruthy()
    })

    // Check all tabs are present
    expect(screen.getByText('Basic details')).toBeTruthy()
    expect(screen.getByText('Job and pay')).toBeTruthy()
    expect(screen.getByText('Taxes')).toBeTruthy()
    expect(screen.getByText('Documents')).toBeTruthy()
  })

  it('displays employee basic details on default tab', async () => {
    renderWithProviders(
      <Dashboard companyId="company-123" employeeId="employee-123" onEvent={onEvent} />,
    )

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeTruthy()
    })

    expect(screen.getByText('Legal name')).toBeTruthy()
    expect(screen.getByText('Social security number')).toBeTruthy()
    expect(screen.getByText('Date of birth')).toBeTruthy()
  })

  it('displays home and work addresses', async () => {
    renderWithProviders(
      <Dashboard companyId="company-123" employeeId="employee-123" onEvent={onEvent} />,
    )

    await waitFor(() => {
      expect(screen.getByText('Home address')).toBeTruthy()
    })

    expect(screen.getByText('123 Main St Apt 4B')).toBeTruthy()
    expect(screen.getByText('San Francisco, CA 94102')).toBeTruthy()

    expect(screen.getByText('Work address')).toBeTruthy()
    expect(screen.getByText('456 Office Blvd')).toBeTruthy()
    expect(screen.getByText('San Francisco, CA 94103')).toBeTruthy()
  })

  it('switches to Job and pay tab', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <Dashboard companyId="company-123" employeeId="employee-123" onEvent={onEvent} />,
    )

    await waitFor(() => {
      expect(screen.getByText('Basic details')).toBeTruthy()
    })

    const jobAndPayTab = screen.getByText('Job and pay')
    await user.click(jobAndPayTab)

    await waitFor(() => {
      expect(screen.getByText('Compensation')).toBeTruthy()
    })

    expect(screen.getByText('Payment')).toBeTruthy()
    expect(screen.getByText('Deductions')).toBeTruthy()
    expect(screen.getByText('Paystubs')).toBeTruthy()
  })

  it('switches to Taxes tab', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <Dashboard companyId="company-123" employeeId="employee-123" onEvent={onEvent} />,
    )

    await waitFor(() => {
      expect(screen.getByText('Taxes')).toBeTruthy()
    })

    const taxesTab = screen.getByText('Taxes')
    await user.click(taxesTab)

    await waitFor(() => {
      expect(screen.getByText('Federal taxes')).toBeTruthy()
    })

    expect(screen.getByText('State taxes')).toBeTruthy()
  })

  it('switches to Documents tab', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <Dashboard companyId="company-123" employeeId="employee-123" onEvent={onEvent} />,
    )

    await waitFor(() => {
      expect(screen.getByText('Documents')).toBeTruthy()
    })

    const documentsTab = screen.getByText('Documents')
    await user.click(documentsTab)

    await waitFor(() => {
      expect(screen.getByText('Forms')).toBeTruthy()
    })
  })

  it('emits EMPLOYEE_UPDATE event when clicking edit basic details', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <Dashboard companyId="company-123" employeeId="employee-123" onEvent={onEvent} />,
    )

    await waitFor(() => {
      expect(screen.getByText('Basic details')).toBeTruthy()
    })

    // Find the Edit button in Basic Details section
    const editButtons = screen.getAllByText('Edit')
    await user.click(editButtons[0])

    expect(onEvent).toHaveBeenCalledWith('EMPLOYEE_UPDATE', {
      employeeId: 'employee-123',
    })
  })

  it('emits EMPLOYEE_HOME_ADDRESS event when clicking manage home address', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <Dashboard companyId="company-123" employeeId="employee-123" onEvent={onEvent} />,
    )

    await waitFor(() => {
      expect(screen.getByText('Home address')).toBeTruthy()
    })

    // Find the Manage button for home address
    const manageButtons = screen.getAllByText('Manage')
    await user.click(manageButtons[0])

    expect(onEvent).toHaveBeenCalledWith('EMPLOYEE_HOME_ADDRESS', {
      employeeId: 'employee-123',
    })
  })

  it('emits EMPLOYEE_WORK_ADDRESS event when clicking manage work address', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <Dashboard companyId="company-123" employeeId="employee-123" onEvent={onEvent} />,
    )

    await waitFor(() => {
      expect(screen.getByText('Work address')).toBeTruthy()
    })

    // Find the Manage button for work address
    const manageButtons = screen.getAllByText('Manage')
    await user.click(manageButtons[1])

    expect(onEvent).toHaveBeenCalledWith('EMPLOYEE_WORK_ADDRESS', {
      employeeId: 'employee-123',
    })
  })

  it('displays federal tax information', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <Dashboard companyId="company-123" employeeId="employee-123" onEvent={onEvent} />,
    )

    await waitFor(() => {
      expect(screen.getByText('Taxes')).toBeTruthy()
    })

    const taxesTab = screen.getByText('Taxes')
    await user.click(taxesTab)

    await waitFor(() => {
      expect(screen.getByText('Filing status')).toBeTruthy()
    })

    expect(screen.getByText('Married')).toBeTruthy()
  })

  it('displays empty state for documents when no forms available', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <Dashboard companyId="company-123" employeeId="employee-123" onEvent={onEvent} />,
    )

    await waitFor(() => {
      expect(screen.getByText('Documents')).toBeTruthy()
    })

    const documentsTab = screen.getByText('Documents')
    await user.click(documentsTab)

    await waitFor(() => {
      expect(screen.getByText('No forms')).toBeTruthy()
    })

    expect(screen.getByText('Employee forms will appear here once available')).toBeTruthy()
  })
})
