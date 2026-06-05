import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { Profile } from './Profile'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { handleGetEmployee, handleUpdateEmployee } from '@/test/mocks/apis/employees'
import { componentEvents } from '@/shared/constants'

const employeeWithRequiredFields = {
  uuid: 'employee-123',
  first_name: 'Isom',
  middle_initial: 'J',
  last_name: 'Jaskolski',
  email: 'isom@example.com',
  version: '1',
  date_of_birth: '1986-06-25',
  has_ssn: true,
  ssn: '',
  jobs: [
    {
      uuid: 'job-1',
      version: '1',
      employee_uuid: 'employee-123',
      primary: true,
      hire_date: '2020-01-20',
      compensations: [],
    },
  ],
}

describe('Profile (management block)', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('renders the card initially with the basic-details title and Edit button', async () => {
    renderWithProviders(<Profile employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    expect(screen.getByText('Basic details')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull()
  })

  it('transitions card → editProfile when the Edit button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Profile employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Edit' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_PROFILE_EDIT_REQUESTED,
      { employeeId: 'employee-123' },
    )
  })

  it('returns to the card without an alert when Cancel is clicked from edit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Profile employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    })

    expect(screen.queryByText('Profile updated')).toBeNull()
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_PROFILE_EDIT_CANCELLED,
      undefined,
    )
  })

  it('returns to the card with the profileUpdated alert after a successful save', async () => {
    const user = userEvent.setup()
    server.use(
      handleGetEmployee(() => HttpResponse.json(employeeWithRequiredFields)),
      handleUpdateEmployee(
        vi.fn<HttpResponseResolver>(async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>
          return HttpResponse.json({
            ...employeeWithRequiredFields,
            ...body,
            version: '2',
          })
        }),
      ),
    )

    renderWithProviders(<Profile employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(
      () => {
        expect(screen.getByText('Profile updated')).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_PROFILE_UPDATED,
      expect.any(Object),
    )
  })
})
