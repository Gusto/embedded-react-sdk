import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { PaySchedule } from './PaySchedule'
import { server } from '@/test/mocks/server'
import { GustoTestApiProvider } from '@/test/GustoTestApiProvider'
import { componentEvents } from '@/shared/constants'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import {
  handleCreatePaySchedule,
  handleGetPaySchedules,
  handleUpdatePaySchedule,
} from '@/test/mocks/apis/payschedule'

vi.mock('@/hooks/useContainerBreakpoints/useContainerBreakpoints', async () => {
  const actual = await vi.importActual('@/hooks/useContainerBreakpoints/useContainerBreakpoints')
  return {
    ...actual,
    default: () => ['base', 'small', 'medium'],
    useContainerBreakpoints: () => ['base', 'small', 'medium'],
  }
})

describe('PaySchedule', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  describe('mode transitions and component rendering', () => {
    beforeEach(() => {
      server.use(
        handleGetPaySchedules(() =>
          HttpResponse.json([
            {
              uuid: 'schedule-1',
              frequency: 'Every week' as const,
              anchor_pay_date: '2024-01-01',
              anchor_end_of_pay_period: '2024-01-07',
              custom_name: 'Weekly Schedule',
              active: true,
            },
          ]),
        ),
      )
    })

    it('starts in LIST_PAY_SCHEDULES mode with correct components', async () => {
      render(
        <GustoTestApiProvider>
          <PaySchedule companyId="123" onEvent={() => {}} />
        </GustoTestApiProvider>,
      )

      // Wait for loading to complete and initial content to appear
      await waitFor(() => {
        expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
      })

      // Check Head component in list mode
      const header = screen.getByRole('banner')
      expect(header).toBeInTheDocument()
      expect(within(header).getByRole('heading')).toHaveTextContent(/set up pay schedule/i)
      expect(screen.getByText(/laws around when you must pay/i)).toBeInTheDocument()

      // Check List component with table structure
      expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()

      // Check Actions component in list mode
      expect(screen.getByRole('button', { name: /add another pay schedule/i })).toBeInTheDocument()

      // Edit component should not be visible
      expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument()
    })

    it('transitions to ADD_PAY_SCHEDULE mode with correct components', async () => {
      const user = userEvent.setup()

      render(
        <GustoTestApiProvider>
          <PaySchedule companyId="123" onEvent={() => {}} />
        </GustoTestApiProvider>,
      )

      // Wait for loading to complete and add button to appear
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /add another pay schedule/i }),
        ).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /add another pay schedule/i }))

      // Check Head component in add mode
      expect(screen.getByRole('heading', { name: /add pay schedule/i })).toBeInTheDocument()

      // Check Edit component is visible with form fields
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /frequency/i })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: /first pay date/i })).toBeInTheDocument()

      // Check Actions component in add mode
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()

      // List component should not be visible
      expect(screen.queryByText('Weekly Schedule')).not.toBeInTheDocument()
    })

    it('transitions to EDIT_PAY_SCHEDULE mode with correct components', async () => {
      const user = userEvent.setup()

      render(
        <GustoTestApiProvider>
          <PaySchedule companyId="123" onEvent={() => {}} />
        </GustoTestApiProvider>,
      )

      // Wait for loading to complete and content to appear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /actions/i })).toBeInTheDocument()
      })

      // Open actions menu and click edit
      const actionsButton = screen.getByRole('button', { name: /actions/i })
      await user.click(actionsButton)
      await user.click(screen.getByRole('menuitem', { name: /edit/i }))

      // Check Head component in edit mode
      expect(screen.getByRole('heading', { name: /edit pay schedule/i })).toBeInTheDocument()

      // Check Edit component is visible with populated form
      expect(screen.getByDisplayValue('Weekly Schedule')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /every week/i })).toBeInTheDocument()

      // Check Actions component in edit mode
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()

      // List component should not be visible
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('returns to LIST_PAY_SCHEDULES mode when canceling add/edit', async () => {
      const user = userEvent.setup()

      render(
        <GustoTestApiProvider>
          <PaySchedule companyId="123" onEvent={() => {}} />
        </GustoTestApiProvider>,
      )

      // Wait for loading to complete
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /add another pay schedule/i }),
        ).toBeInTheDocument()
      })

      // Test cancel from add mode
      await user.click(screen.getByRole('button', { name: /add another pay schedule/i }))
      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()

      // Test cancel from edit mode
      const actionsButton = screen.getByRole('button', { name: /actions/i })
      await user.click(actionsButton)
      await user.click(screen.getByRole('menuitem', { name: /edit/i }))
      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
    })
  })

  describe('when viewing pay schedules', () => {
    beforeEach(() => {
      server.use(
        handleGetPaySchedules(() =>
          HttpResponse.json([
            {
              uuid: 'schedule-1',
              frequency: 'Every week' as const,
              anchor_pay_date: '2024-01-01',
              anchor_end_of_pay_period: '2024-01-07',
              custom_name: 'Weekly Schedule',
              active: true,
            },
          ]),
        ),
      )
    })

    it('renders existing pay schedules in list mode', async () => {
      render(
        <GustoTestApiProvider>
          <PaySchedule companyId="123" onEvent={() => {}} />
        </GustoTestApiProvider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
      })

      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add another pay schedule/i })).toBeInTheDocument()
    })

    it('allows editing an existing schedule', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()

      render(
        <GustoTestApiProvider>
          <PaySchedule companyId="123" onEvent={onEvent} />
        </GustoTestApiProvider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
      })

      // Open actions menu and click edit
      const actionsButton = screen.getByRole('button', { name: /actions/i })
      await user.click(actionsButton)
      await user.click(screen.getByRole('menuitem', { name: /edit/i }))

      // Verify edit mode
      expect(screen.getByRole('heading', { name: /edit pay schedule/i })).toBeInTheDocument()
      expect(screen.getByDisplayValue('Weekly Schedule')).toBeInTheDocument()

      // Edit the schedule
      await user.type(screen.getByLabelText(/name/i), ' Updated')
      await user.click(screen.getByRole('button', { name: /save/i }))

      expect(onEvent).toHaveBeenCalledWith(componentEvents.PAY_SCHEDULE_UPDATED, expect.any(Object))
    })
  })

  describe('when adding a new schedule', () => {
    beforeEach(() => {
      server.use(
        handleCreatePaySchedule(() =>
          HttpResponse.json({
            uuid: 'new-schedule-1',
            frequency: 'Every week',
            anchor_pay_date: '2024-01-01',
            anchor_end_of_pay_period: '2024-01-07',
            custom_name: 'New Schedule',
            active: true,
          }),
        ),
      )
    })

    it('allows creating a new pay schedule', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()

      render(
        <GustoTestApiProvider>
          <PaySchedule companyId="123" onEvent={onEvent} />
        </GustoTestApiProvider>,
      )

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /add another pay schedule/i }),
        ).toBeInTheDocument()
      })

      // Click add button
      await user.click(screen.getByRole('button', { name: /add another pay schedule/i }))

      // Fill out form
      await user.type(screen.getByLabelText(/name/i), 'New Schedule')

      const frequencySelect = screen.getByRole('button', { name: /frequency/i })
      await user.click(frequencySelect)
      await user.click(screen.getByRole('option', { name: /every week/i }))

      // Set dates using the correct group names
      const payDateInput = screen.getByRole('group', { name: 'First pay date' })
      await user.type(within(payDateInput).getByRole('spinbutton', { name: /month/i }), '01')
      await user.type(within(payDateInput).getByRole('spinbutton', { name: /day/i }), '01')
      await user.type(within(payDateInput).getByRole('spinbutton', { name: /year/i }), '2024')

      const endDateInput = screen.getByRole('group', { name: 'First pay period end date' })
      await user.type(within(endDateInput).getByRole('spinbutton', { name: /month/i }), '01')
      await user.type(within(endDateInput).getByRole('spinbutton', { name: /day/i }), '07')
      await user.type(within(endDateInput).getByRole('spinbutton', { name: /year/i }), '2024')

      // Submit form
      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(componentEvents.PAY_SCHEDULE_CREATED, {
          uuid: 'new-schedule-1',
          frequency: 'Every week',
          anchor_pay_date: '2024-01-01',
          anchor_end_of_pay_period: '2024-01-07',
          custom_name: 'New Schedule',
          active: true,
        })
      })
    })

    it('validates required fields', async () => {
      const user = userEvent.setup()

      // Mock validation error response
      server.use(
        handleCreatePaySchedule(() =>
          HttpResponse.json(
            {
              errors: [
                {
                  error_key: 'frequency',
                  category: 'invalid_attribute_value',
                  message: 'Frequency is required',
                },
                {
                  error_key: 'anchor_pay_date',
                  category: 'invalid_attribute_value',
                  message: 'First pay date is required',
                },
              ],
            },
            { status: 422 },
          ),
        ),
      )

      render(
        <GustoTestApiProvider>
          <PaySchedule companyId="123" onEvent={() => {}} />
        </GustoTestApiProvider>,
      )

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /add another pay schedule/i }),
        ).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /add another pay schedule/i }))
      await user.click(screen.getByRole('button', { name: /save/i }))

      // Check for validation messages
      await waitFor(() => {
        expect(screen.getByText('Frequency is required')).toBeInTheDocument()
        expect(screen.getByText('First pay date is required')).toBeInTheDocument()
      })
    })
  })

  describe('when handling API errors', () => {
    it('displays error message on update failure', async () => {
      const user = userEvent.setup()

      server.use(
        handleUpdatePaySchedule(() =>
          HttpResponse.json(
            {
              errors: [
                {
                  error_key: 'frequency',
                  category: 'invalid_attribute_value',
                  message: 'Invalid frequency',
                },
              ],
            },
            { status: 422 },
          ),
        ),
      )

      render(
        <GustoTestApiProvider>
          <PaySchedule companyId="123" onEvent={() => {}} />
        </GustoTestApiProvider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
      })

      // Start edit
      const actionsButton = screen.getByRole('button', { name: /actions/i })
      await user.click(actionsButton)
      await user.click(screen.getByRole('menuitem', { name: /edit/i }))

      // Try to save
      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(screen.getByText(/Invalid frequency/i)).toBeInTheDocument()
      })
    })
  })

  describe('with default values', () => {
    it('pre-fills form with provided default values', async () => {
      const user = userEvent.setup()
      const defaultValues = {
        frequency: 'Every week' as const,
        anchor_pay_date: '2024-01-01',
        anchor_end_of_pay_period: '2024-01-07',
        custom_name: 'Default Schedule',
      }

      render(
        <GustoTestApiProvider>
          <PaySchedule companyId="123" onEvent={() => {}} defaultValues={defaultValues} />
        </GustoTestApiProvider>,
      )

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /add another pay schedule/i }),
        ).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /add another pay schedule/i }))

      expect(screen.getByDisplayValue(defaultValues.custom_name)).toBeInTheDocument()
      expect(screen.getByDisplayValue(defaultValues.anchor_pay_date)).toBeInTheDocument()
    })
  })
})
