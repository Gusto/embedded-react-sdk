import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dashboard } from './Dashboard'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Dashboard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    onEvent.mockClear()
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
    await user.click(editButtons[0]!)

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
    await user.click(manageButtons[0]!)

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
    await user.click(manageButtons[1]!)

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
