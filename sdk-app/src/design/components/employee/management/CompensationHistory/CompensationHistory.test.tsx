import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Job } from '@gusto/embedded-api-v-2026-02-01/models/components/job'
import type { Compensation } from '@gusto/embedded-api-v-2026-02-01/models/components/compensation'
import { CompensationHistory } from './CompensationHistory'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

function buildCompensation(overrides: {
  uuid?: string
  jobUuid?: string
  title?: string
  rate?: string
}): Compensation {
  return {
    uuid: overrides.uuid ?? 'compensation-uuid',
    version: 'compensation-version',
    paymentUnit: 'Hour',
    flsaStatus: 'Nonexempt',
    adjustForMinimumWage: false,
    jobUuid: overrides.jobUuid ?? 'job-uuid',
    title: overrides.title ?? 'My Job',
    effectiveDate: '2024-12-24',
    rate: overrides.rate ?? '100.00',
  } as Compensation
}

function buildJob(overrides: {
  uuid?: string
  title?: string
  currentCompensationUuid?: string
}): Job {
  const uuid = overrides.uuid ?? 'job-uuid'
  const currentCompensationUuid = overrides.currentCompensationUuid ?? 'compensation-uuid'
  const title = overrides.title ?? 'My Job'
  return {
    uuid,
    version: 'job-version',
    employeeUuid: 'employee-uuid',
    currentCompensationUuid,
    paymentUnit: 'Hour',
    primary: true,
    twoPercentShareholder: false,
    title,
    compensations: [buildCompensation({ uuid: currentCompensationUuid, jobUuid: uuid, title })],
    rate: '100.00',
    hireDate: '2024-12-24',
  } as Job
}

const singleJob: Job[] = [buildJob({ uuid: 'job-1', title: 'My Job' })]

const multiJob: Job[] = [
  buildJob({ uuid: 'job-1', currentCompensationUuid: 'comp-1', title: 'My Job' }),
  buildJob({
    uuid: 'job-2',
    currentCompensationUuid: 'comp-2',
    title: 'An additional job',
  }),
]

describe('components/employee/management/CompensationHistory', () => {
  it('renders the job title as heading and omits the job filter for a single job', () => {
    renderWithProviders(<CompensationHistory jobs={singleJob} />)

    expect(screen.getByRole('heading', { name: 'My Job' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /All jobs/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Job title' })).not.toBeInTheDocument()
  })

  it('renders the combined view with both jobs by default when there are multiple jobs', () => {
    renderWithProviders(<CompensationHistory jobs={multiJob} />)

    expect(screen.getByRole('heading', { name: 'Compensation history' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /All jobs/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Job title' })).toBeInTheDocument()
    expect(screen.getByRole('gridcell', { name: 'My Job' })).toBeInTheDocument()
    expect(screen.getByRole('gridcell', { name: 'An additional job' })).toBeInTheDocument()
  })

  it('filters rows to the selected job when a job is chosen from the filter', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CompensationHistory jobs={multiJob} />)

    await user.click(screen.getByRole('button', { name: /All jobs/i }))
    await user.click(screen.getByRole('option', { name: 'An additional job' }))

    expect(screen.getByRole('gridcell', { name: 'An additional job' })).toBeInTheDocument()
    expect(screen.queryByRole('gridcell', { name: 'My Job' })).not.toBeInTheDocument()
  })

  it('renders an empty DataView with an emptyState message when there are no jobs', () => {
    renderWithProviders(<CompensationHistory jobs={[]} />)

    expect(screen.getByRole('heading', { name: 'Compensation history' })).toBeInTheDocument()
    expect(screen.getByRole('grid')).toBeInTheDocument()
    expect(screen.getByText('There is no compensation history.')).toBeInTheDocument()
    // No job filter is shown when there are no jobs to filter to.
    expect(screen.queryByRole('button', { name: /All jobs/i })).not.toBeInTheDocument()
  })
})
