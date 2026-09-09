import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { CompensationAddJobForm } from './CompensationAddJobForm'
import { server } from '@/test/mocks/server'
import { handleGetEmployeeJobs } from '@/test/mocks/apis/employees'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { getMinimumWages } from '@/test/mocks/apis/company_locations'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('management/CompensationAddJobForm', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(getMinimumWages)
    server.use(handleGetEmployeeJobs(() => HttpResponse.json([])))
  })

  it('applies custom className', async () => {
    const { container } = renderWithProviders(
      <CompensationAddJobForm
        employeeId="employee-uuid"
        onEvent={vi.fn()}
        className="custom-class"
      />,
    )

    await screen.findByRole('heading', { name: 'Add a job' })

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })
})
