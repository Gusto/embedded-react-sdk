import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { CompensationEditForm } from './CompensationEditForm'
import { server } from '@/test/mocks/server'
import { handleGetEmployeeJobs } from '@/test/mocks/apis/employees'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { getMinimumWages } from '@/test/mocks/apis/company_locations'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { buildEmployeeWithJobs } from '@/test/factories/jobsAndCompensations'

describe('management/CompensationEditForm', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(getMinimumWages)
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
      ),
    )
  })

  it('applies custom className', async () => {
    const { container } = renderWithProviders(
      <CompensationEditForm
        employeeId="employee-uuid"
        jobId="job-uuid"
        onEvent={vi.fn()}
        className="custom-class"
      />,
    )

    await screen.findByRole('heading', { name: 'Edit compensation' })

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })
})
