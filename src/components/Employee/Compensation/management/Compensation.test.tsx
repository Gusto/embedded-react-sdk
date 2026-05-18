import { beforeEach, describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { Compensation } from './Compensation'
import { server } from '@/test/mocks/server'
import { handleGetEmployeeJobs } from '@/test/mocks/apis/employees'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { getMinimumWages } from '@/test/mocks/apis/company_locations'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { buildEmployeeWithJobs } from '@/test/factories/jobsAndCompensations'

describe('management/Compensation flow', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(
      getMinimumWages,
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
      ),
    )
  })

  it('starts on the list view', async () => {
    renderWithProviders(
      <Compensation employeeId="employee-uuid" hireDate="2024-12-24" onEvent={() => {}} />,
    )

    expect(await screen.findByText('Primary job')).toBeInTheDocument()
  })

  it('navigates list -> editCompensation -> list via Cancel', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Compensation employeeId="employee-uuid" hireDate="2024-12-24" onEvent={() => {}} />,
    )

    await screen.findByText('Primary job')
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    expect(await screen.findByRole('heading', { name: 'Edit compensation' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(await screen.findByText('Primary job')).toBeInTheDocument()
  })

  it('navigates list -> addJob -> list via Cancel', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Compensation employeeId="employee-uuid" hireDate="2024-12-24" onEvent={() => {}} />,
    )

    await screen.findByText('Primary job')
    await user.click(screen.getByRole('button', { name: /add another job/i }))

    expect(await screen.findByRole('heading', { name: 'Add another job' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(await screen.findByText('Primary job')).toBeInTheDocument()
  })
})
