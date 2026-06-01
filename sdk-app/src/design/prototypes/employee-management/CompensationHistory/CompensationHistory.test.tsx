import { beforeEach, describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { CompensationHistory } from './'
import { server } from '@/test/mocks/server'
import { handleGetEmployeeJobs } from '@/test/mocks/apis/employees'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { buildEmployeeWithJobs } from '@/test/factories/jobsAndCompensations'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { mockUseContainerBreakpoints } from '@/test/setup'

describe('prototypes/employee-management/CompensationHistory', () => {
  beforeEach(() => {
    setupApiTestMocks()
    // Force the DataView's container-breakpoints hook to report a desktop
    // width so DataTable (not DataCards) renders — lets the tests use
    // table-role queries.
    mockUseContainerBreakpoints.mockReturnValue(['base', 'small', 'medium', 'large'])
  })

  it('renders the job title as heading and omits the job filter for a single job', async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
      ),
    )

    renderWithProviders(<CompensationHistory employeeId="employee-uuid" />)

    expect(await screen.findByRole('heading', { name: 'My Job' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /All jobs/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Job title' })).not.toBeInTheDocument()
  })

  it('renders the combined view with both jobs by default when there are multiple jobs', async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'multiJob' })),
      ),
    )

    renderWithProviders(<CompensationHistory employeeId="employee-uuid" />)

    expect(await screen.findByRole('heading', { name: 'Compensation history' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /All jobs/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Job title' })).toBeInTheDocument()
    expect(screen.getByRole('gridcell', { name: 'My Job' })).toBeInTheDocument()
    expect(screen.getByRole('gridcell', { name: 'An additional job' })).toBeInTheDocument()
  })

  it('filters rows to the selected job when a job is chosen from the filter', async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'multiJob' })),
      ),
    )

    const user = userEvent.setup()
    renderWithProviders(<CompensationHistory employeeId="employee-uuid" />)

    await screen.findByRole('heading', { name: 'Compensation history' })

    await user.click(screen.getByRole('button', { name: /All jobs/i }))
    await user.click(screen.getByRole('option', { name: 'An additional job' }))

    expect(screen.getByRole('gridcell', { name: 'An additional job' })).toBeInTheDocument()
    expect(screen.queryByRole('gridcell', { name: 'My Job' })).not.toBeInTheDocument()
  })

  it('renders an empty state when the employee has no jobs', async () => {
    server.use(
      handleGetEmployeeJobs(() => HttpResponse.json(buildEmployeeWithJobs({ scenario: 'noJobs' }))),
    )

    renderWithProviders(<CompensationHistory employeeId="employee-uuid" />)

    expect(await screen.findByText('No compensation history yet.')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Compensation history' })).not.toBeInTheDocument()
    expect(screen.queryByRole('grid')).not.toBeInTheDocument()
  })
})
