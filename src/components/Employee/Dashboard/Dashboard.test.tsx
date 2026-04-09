import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dashboard } from './Dashboard'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'

describe('Dashboard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    onEvent.mockClear()
    setupApiTestMocks()
  })

  it('renders dashboard and loads employee data', async () => {
    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    // Wait for component to finish loading by checking for a key element
    await waitFor(
      () => {
        expect(screen.getByText('Legal name')).toBeTruthy()
      },
      { timeout: 5000 },
    )

    // Verify basic structure is present
    expect(screen.getByText('Home address')).toBeTruthy()
    expect(screen.getByText('Work address')).toBeTruthy()
  })

  it('displays employee basic details', async () => {
    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Legal name')).toBeTruthy()
    })

    expect(screen.getByText('Date of birth')).toBeTruthy()
    expect(screen.getByText('Personal email')).toBeTruthy()
  })

  it('emits EMPLOYEE_UPDATE event when clicking edit basic details', async () => {
    const user = userEvent.setup()

    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Legal name')).toBeTruthy()
    })

    // Find the Edit button in Basic Details section
    const editButtons = screen.getAllByText('Edit')
    await user.click(editButtons[0]!)

    expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_UPDATE, {
      employeeId: 'employee-123',
    })
  })

  it('emits EMPLOYEE_HOME_ADDRESS event when clicking manage home address', async () => {
    const user = userEvent.setup()

    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Home address')).toBeTruthy()
    })

    // Find the Manage button for home address
    const manageButtons = screen.getAllByText('Manage')
    await user.click(manageButtons[0]!)

    expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_HOME_ADDRESS, {
      employeeId: 'employee-123',
    })
  })

  it('emits EMPLOYEE_WORK_ADDRESS event when clicking manage work address', async () => {
    const user = userEvent.setup()

    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Work address')).toBeTruthy()
    })

    // Find the Manage button for work address
    const manageButtons = screen.getAllByText('Manage')
    await user.click(manageButtons[1]!)

    expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_WORK_ADDRESS, {
      employeeId: 'employee-123',
    })
  })
})
