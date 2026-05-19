import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import type { DashboardProps } from './Dashboard'
import { Dashboard } from './Dashboard'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { handleGetEmployeeForms, i9Form } from '@/test/mocks/apis/employee_forms'
import { componentEvents } from '@/shared/constants'
import { assertDefined } from '@/test-utils/assertions'
import { getFixture } from '@/test/mocks/fixtures/getFixture'
import { handleGetEmployee } from '@/test/mocks/apis/employees'

vi.mock('@/hooks/useContainerBreakpoints/useContainerBreakpoints', () => {
  const useContainerBreakpoints = () => ['small', 'medium', 'large']
  return {
    useContainerBreakpoints,
    default: useContainerBreakpoints,
  }
})

describe('Dashboard', () => {
  const onEvent = vi.fn<DashboardProps['onEvent']>()

  beforeEach(() => {
    onEvent.mockClear()
    setupApiTestMocks()
  })

  it('renders dashboard and loads employee data', async () => {
    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => expect(screen.getByText('Legal name')).toBeInTheDocument())

    expect(screen.getByText('Home address')).toBeInTheDocument()
    expect(screen.getByText('Work address')).toBeInTheDocument()
  })

  it('displays employee basic details', async () => {
    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => expect(screen.getByText('Legal name')).toBeInTheDocument())

    expect(screen.getByText('Date of birth')).toBeInTheDocument()
    expect(screen.getByText('Personal email')).toBeInTheDocument()
  })

  it('emits EMPLOYEE_UPDATE event when clicking edit basic details', async () => {
    const user = userEvent.setup()

    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => expect(screen.getByText('Legal name')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Edit' }))

    expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_UPDATE, {
      employeeId: 'employee-123',
    })
  })

  it('emits EMPLOYEE_HOME_ADDRESS event when clicking manage home address', async () => {
    const user = userEvent.setup()

    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => expect(screen.getByText('Home address')).toBeInTheDocument())

    const homeAddressBox = screen
      .getByRole('heading', { name: 'Home address' })
      .closest<HTMLElement>('[data-testid="data-box"]')
    assertDefined(homeAddressBox)
    await user.click(within(homeAddressBox).getByRole('button', { name: 'Manage' }))

    expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_HOME_ADDRESS, {
      employeeId: 'employee-123',
    })
  })

  it('emits EMPLOYEE_WORK_ADDRESS event when clicking manage work address', async () => {
    const user = userEvent.setup()

    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => expect(screen.getByText('Work address')).toBeInTheDocument())

    const workAddressBox = screen
      .getByRole('heading', { name: 'Work address' })
      .closest<HTMLElement>('[data-testid="data-box"]')
    assertDefined(workAddressBox)
    await user.click(within(workAddressBox).getByRole('button', { name: 'Manage' }))

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

    await waitFor(() => expect(screen.getByText('Legal name')).toBeInTheDocument())

    await user.click(screen.getByRole('tab', { name: 'Taxes' }))

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'State taxes' })).toBeInTheDocument(),
    )

    const stateTaxesBox = screen
      .getByRole('heading', { name: 'State taxes' })
      .closest<HTMLElement>('[data-testid="data-box"]')
    assertDefined(stateTaxesBox)
    await user.click(within(stateTaxesBox).getByRole('button', { name: 'Edit' }))

    expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_STATE_TAXES_EDIT, {
      employeeId: 'employee-123',
    })
  })

  it('shows employee forms on the Documents tab', async () => {
    server.use(handleGetEmployeeForms(() => HttpResponse.json([i9Form])))
    const user = userEvent.setup()

    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => expect(screen.getByText('Legal name')).toBeInTheDocument())

    await user.click(screen.getByRole('tab', { name: 'Documents' }))

    await waitFor(() => expect(screen.getByText('Form I-9')).toBeInTheDocument())
  })

  it('emits EMPLOYEE_VIEW_FORM_TO_SIGN with employeeId and formId when clicking View on a form', async () => {
    server.use(handleGetEmployeeForms(() => HttpResponse.json([i9Form])))
    const user = userEvent.setup()

    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => expect(screen.getByText('Legal name')).toBeInTheDocument())

    await user.click(screen.getByRole('tab', { name: 'Documents' }))

    await waitFor(() => expect(screen.getByText('Form I-9')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'View' }))

    expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_VIEW_FORM_TO_SIGN, {
      employeeId: 'employee-123',
      formId: 'i9-form-123',
    })
  })
})
