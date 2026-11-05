import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { PaySchedulesCard } from './PaySchedulesCard'
import { server } from '@/test/mocks/server'
import {
  handleGetPaySchedules,
  handleGetPayScheduleAssignments,
} from '@/test/mocks/apis/payschedule'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const fixtureSchedule = {
  uuid: 'schedule-1',
  version: 'schedule-version',
  frequency: 'Every other week',
  custom_name: 'Biweekly',
  name: 'Biweekly',
  anchor_pay_date: '2025-01-10',
  anchor_end_of_pay_period: '2025-01-05',
  active: true,
  auto_payroll: false,
}

describe('PaySchedulesCard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(
      handleGetPayScheduleAssignments(() =>
        HttpResponse.json({ type: 'single', default_pay_schedule_uuid: 'schedule-1' }),
      ),
      handleGetPaySchedules(() => HttpResponse.json([fixtureSchedule])),
    )
  })

  it('lists each schedule with its frequency and names the assignment mode', async () => {
    renderWithProviders(<PaySchedulesCard companyId="company-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage pay schedules' })).toBeEnabled()
    })

    expect(screen.getByRole('heading', { name: 'Pay schedules' })).toBeInTheDocument()
    expect(screen.getByText('Biweekly')).toBeInTheDocument()
    expect(screen.getByText('Every other week')).toBeInTheDocument()
    expect(screen.getByText('One schedule for all employees')).toBeInTheDocument()
  })

  it('reports every schedule when the company assigns them by department', async () => {
    server.use(
      handleGetPayScheduleAssignments(() =>
        HttpResponse.json({ type: 'by_department', default_pay_schedule_uuid: 'schedule-1' }),
      ),
      handleGetPaySchedules(() =>
        HttpResponse.json([
          fixtureSchedule,
          {
            ...fixtureSchedule,
            uuid: 'schedule-2',
            custom_name: 'Monthly leadership',
            name: 'Monthly leadership',
            frequency: 'Monthly',
          },
        ]),
      ),
    )

    renderWithProviders(<PaySchedulesCard companyId="company-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Assigned per department')).toBeInTheDocument()
    })
    expect(screen.getByText('Biweekly')).toBeInTheDocument()
    expect(screen.getByText('Monthly leadership')).toBeInTheDocument()
  })

  it('emits the edit-requested event with the company id when Manage is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PaySchedulesCard companyId="company-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage pay schedules' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Manage pay schedules' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.COMPANY_MANAGEMENT_PAY_SCHEDULE_EDIT_REQUESTED,
      { companyId: 'company-123' },
    )
  })

  it('renders the empty state with an Add CTA when the company has no schedules', async () => {
    server.use(
      handleGetPayScheduleAssignments(() => HttpResponse.json({})),
      handleGetPaySchedules(() => HttpResponse.json([])),
    )

    renderWithProviders(<PaySchedulesCard companyId="company-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('No pay schedule yet')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Add pay schedule' })).toBeInTheDocument()
  })
})
