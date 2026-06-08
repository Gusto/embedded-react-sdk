import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { Compensation } from './Compensation'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { handleGetEmployeeJobs } from '@/test/mocks/apis/employees'
import { getMinimumWages } from '@/test/mocks/apis/company_locations'
import { buildEmployeeWithJobs } from '@/test/factories/jobsAndCompensations'
import { componentEvents } from '@/shared/constants'

describe('Compensation (management block)', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    server.use(getMinimumWages)
    onEvent.mockClear()
  })

  it('starts on the card surface and renders the compensation summary', async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
      ),
    )
    renderWithProviders(<Compensation employeeId="employee-uuid" onEvent={onEvent} />)

    expect(await screen.findByText('My Job')).toBeInTheDocument()
  })

  it('drives card → editCompensation → back through the machine', async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(<Compensation employeeId="employee-uuid" onEvent={onEvent} />)

    await screen.findByText('My Job')
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    expect(await screen.findByRole('heading', { name: 'Edit compensation' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.getByText('My Job')).toBeInTheDocument()
    })
    expect(screen.queryByRole('heading', { name: 'Edit compensation' })).toBeNull()
  })

  it('drives card → addJob (empty state) → back through the machine', async () => {
    server.use(
      handleGetEmployeeJobs(() => HttpResponse.json(buildEmployeeWithJobs({ scenario: 'noJobs' }))),
    )
    const user = userEvent.setup()
    renderWithProviders(<Compensation employeeId="employee-uuid" onEvent={onEvent} />)

    expect(await screen.findByText('No compensation')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add job' }))

    expect(await screen.findByRole('heading', { name: 'Add a job' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.getByText('No compensation')).toBeInTheDocument()
    })
  })

  it('drives card → addAnotherJob → back through the machine', async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'multiJob' })),
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(<Compensation employeeId="employee-uuid" onEvent={onEvent} />)

    await screen.findByText('My Job')
    await user.click(screen.getByRole('button', { name: 'Add another job' }))

    expect(await screen.findByRole('heading', { name: 'Add another job' })).toBeInTheDocument()
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_ADD_ANOTHER_REQUESTED,
      { employeeId: 'employee-uuid' },
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.getByText('My Job')).toBeInTheDocument()
    })
  })
})
