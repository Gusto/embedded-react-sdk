import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { CompensationHistory } from './CompensationHistory'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { handleGetEmployeeJobs } from '@/test/mocks/apis/employees'
import { buildEmployeeWithJobs } from '@/test/factories/jobsAndCompensations'
import { componentEvents } from '@/shared/constants'

const unstableFeatures = { compensationHistory: true }

function renderHistory(onEvent = vi.fn()) {
  renderWithProviders(<CompensationHistory employeeId="employee-uuid" onEvent={onEvent} />, {
    unstableFeatures,
  })
  return onEvent
}

describe('CompensationHistory', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('renders one section per job with every compensation, newest effective date first', async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'compensationHistory' })),
      ),
    )

    renderHistory()

    expect(await screen.findByRole('heading', { name: 'Software engineer' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Team lead' })).toBeInTheDocument()

    const [primaryTable] = screen.getAllByRole('grid')
    const rows = within(primaryTable!).getAllByRole('row').slice(1)

    expect(rows).toHaveLength(4)
    expect(rows.map(row => within(row).getAllByRole('rowheader')[0]?.textContent)).toEqual([
      'March 1, 2099',
      'January 1, 2025',
      'June 1, 2024',
      'February 1, 2023',
    ])
  })

  it('badges the compensation in effect today and any future-dated change', async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'compensationHistory' })),
      ),
    )

    renderHistory()

    const primaryTable = (await screen.findAllByRole('grid'))[0]
    const rows = within(primaryTable!).getAllByRole('row').slice(1)

    expect(within(rows[0]!).getByText('Upcoming')).toBeInTheDocument()
    expect(within(rows[1]!).getByText('Current')).toBeInTheDocument()
    expect(within(rows[2]!).queryByText(/Current|Upcoming/)).toBeNull()
    expect(within(rows[3]!).queryByText(/Current|Upcoming/)).toBeNull()
  })

  it('renders the title, employee type and wage that applied to each compensation', async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'compensationHistory' })),
      ),
    )

    renderHistory()

    const primaryTable = (await screen.findAllByRole('grid'))[0]
    const rows = within(primaryTable!).getAllByRole('row').slice(1)

    // The upcoming row carries its own title, classification and rate unit —
    // proof the view reads per-compensation rather than off the job.
    expect(within(rows[0]!).getByRole('gridcell', { name: 'Senior engineer' })).toBeInTheDocument()
    expect(
      within(rows[0]!).getByRole('gridcell', { name: 'Salary/No overtime' }),
    ).toBeInTheDocument()
    expect(
      within(rows[0]!).getByRole('gridcell', { name: '$140,000.00 per year' }),
    ).toBeInTheDocument()

    expect(within(rows[3]!).getByRole('gridcell', { name: 'Junior engineer' })).toBeInTheDocument()
    expect(within(rows[3]!).getByRole('gridcell', { name: '$60.00 per hour' })).toBeInTheDocument()
  })

  it('renders an empty state when the employee has no jobs', async () => {
    server.use(handleGetEmployeeJobs(() => HttpResponse.json([])))

    renderHistory()

    expect(await screen.findByText('No compensation history')).toBeInTheDocument()
    expect(screen.queryByRole('grid')).toBeNull()
  })

  it('emits the close event when Back is clicked', async () => {
    const user = userEvent.setup()
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
      ),
    )

    const onEvent = renderHistory()

    await user.click(await screen.findByRole('button', { name: 'Back' }))

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_HISTORY_CLOSED,
        { employeeId: 'employee-uuid' },
      )
    })
  })

  it('surfaces an error naming the flag when compensationHistory is not enabled', async () => {
    // The component is alpha — mounting it without opting in is an integration
    // mistake, so it fails loudly through the SDK error boundary rather than
    // silently rendering nothing.
    vi.spyOn(console, 'error').mockImplementation(() => {})

    renderWithProviders(<CompensationHistory employeeId="employee-uuid" onEvent={vi.fn()} />)

    expect(await screen.findByText(/compensationHistory/)).toBeInTheDocument()
    expect(screen.queryByRole('grid')).toBeNull()
  })
})
