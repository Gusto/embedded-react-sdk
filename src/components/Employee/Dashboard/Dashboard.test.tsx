import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { Dashboard } from './Dashboard'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { handleGetEmployee } from '@/test/mocks/apis/employees'
import { getFixture } from '@/test/mocks/fixtures/getFixture'
import { componentEvents } from '@/shared/constants'

vi.mock('@/hooks/useContainerBreakpoints/useContainerBreakpoints', () => {
  const useContainerBreakpoints = () => ['small', 'medium', 'large']
  return {
    useContainerBreakpoints,
    default: useContainerBreakpoints,
  }
})

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

  it('shows an empty Compensation card with Add job CTA when the employee has no jobs', async () => {
    const user = userEvent.setup()

    const employeeFixture = (await getFixture('get-v1-employees')) as Record<string, unknown>
    server.use(handleGetEmployee(() => HttpResponse.json({ ...employeeFixture, jobs: [] })))

    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Legal name')).toBeTruthy()
    })

    await user.click(screen.getByRole('tab', { name: 'Job and pay' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Compensation' })).toBeInTheDocument()
    })

    expect(screen.getByText('No compensation')).toBeInTheDocument()
    expect(screen.getByText('Compensation will appear here once added')).toBeInTheDocument()

    const addJobButton = screen.getByRole('button', { name: 'Add job' })
    expect(addJobButton).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()

    await user.click(addJobButton)

    expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_JOB_ADD, {
      employeeId: 'employee-123',
    })
  })

  it('emits EMPLOYEE_STATE_TAXES_EDIT with only employeeId when clicking state taxes edit', async () => {
    const user = userEvent.setup()

    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Legal name')).toBeTruthy()
    })

    await user.click(screen.getByRole('tab', { name: 'Taxes' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'State taxes' })).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: 'Edit' })
    expect(editButtons.length).toBeGreaterThanOrEqual(2)
    await user.click(editButtons[1]!)

    expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_STATE_TAXES_EDIT, {
      employeeId: 'employee-123',
    })
    expect(onEvent.mock.calls.at(-1)?.[1]).toEqual({ employeeId: 'employee-123' })
  })
})
