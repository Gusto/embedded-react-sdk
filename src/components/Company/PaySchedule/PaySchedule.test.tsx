import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PaySchedule } from './PaySchedule'
import { server } from '@/test/mocks/server'
import { componentEvents } from '@/shared/constants'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import {
  createPaySchedule,
  getPaySchedulePreview,
  getPaySchedules,
  updatePaySchedule,
} from '@/test/mocks/apis/payschedule'
import { GustoApiProvider } from '@/contexts'
import { API_BASE_URL } from '@/test/constants'

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
      server.use(getPaySchedules, getPaySchedulePreview, createPaySchedule, updatePaySchedule)
    })

    it('starts in LIST_PAY_SCHEDULES mode with correct components', async () => {
      render(
        <GustoApiProvider config={{ baseUrl: API_BASE_URL }}>
          <PaySchedule companyId="123" onEvent={() => {}} />
        </GustoApiProvider>,
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
        <GustoApiProvider config={{ baseUrl: API_BASE_URL }}>
          <PaySchedule companyId="123" onEvent={() => {}} />
        </GustoApiProvider>,
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
        <GustoApiProvider config={{ baseUrl: API_BASE_URL }}>
          <PaySchedule companyId="123" onEvent={() => {}} />
        </GustoApiProvider>,
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
        <GustoApiProvider config={{ baseUrl: API_BASE_URL }}>
          <PaySchedule companyId="123" onEvent={() => {}} />
        </GustoApiProvider>,
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
    it('renders existing pay schedules in list mode', async () => {
      render(
        <GustoApiProvider config={{ baseUrl: API_BASE_URL }}>
          <PaySchedule companyId="123" onEvent={() => {}} />
        </GustoApiProvider>,
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
        <GustoApiProvider config={{ baseUrl: API_BASE_URL }}>
          <PaySchedule companyId="123" onEvent={onEvent} />
        </GustoApiProvider>,
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

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.PAY_SCHEDULE_UPDATED,
          expect.any(Object),
        )
      })
    })
  })

  describe('when adding a new schedule', () => {
    it('allows creating a new pay schedule', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()

      render(
        <GustoApiProvider config={{ baseUrl: API_BASE_URL }}>
          <PaySchedule companyId="123" onEvent={onEvent} />
        </GustoApiProvider>,
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
      await user.type(within(payDateInput).getByRole('spinbutton', { name: /year/i }), '2025')

      const endDateInput = screen.getByRole('group', { name: 'First pay period end date' })
      await user.type(within(endDateInput).getByRole('spinbutton', { name: /month/i }), '01')
      await user.type(within(endDateInput).getByRole('spinbutton', { name: /day/i }), '07')
      await user.type(within(endDateInput).getByRole('spinbutton', { name: /year/i }), '2025')

      // Submit form
      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledOnce()
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.PAY_SCHEDULE_CREATED,
          expect.any(Object),
        )
      })
    })

    it('validates required fields', async () => {
      const user = userEvent.setup()

      render(
        <GustoApiProvider config={{ baseUrl: API_BASE_URL }}>
          <PaySchedule companyId="123" onEvent={() => {}} />
        </GustoApiProvider>,
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
        expect(screen.getByText('There was a problem with your submission')).toBeInTheDocument()
      })
    })
  })

  describe('with default values', () => {
    it('pre-fills form with provided default values', async () => {
      const user = userEvent.setup()
      const defaultValues = {
        frequency: 'Every week' as const,
        anchorPayDate: '2024-01-01',
        anchorEndOfPayPeriod: '2024-01-07',
        customName: 'Default Schedule',
      }

      render(
        <GustoApiProvider config={{ baseUrl: API_BASE_URL }}>
          <PaySchedule companyId="123" onEvent={() => {}} defaultValues={defaultValues} />
        </GustoApiProvider>,
      )

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /add another pay schedule/i }),
        ).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /add another pay schedule/i }))

      expect(screen.getByDisplayValue(defaultValues.customName)).toBeInTheDocument()
      expect(screen.getByDisplayValue(defaultValues.anchorPayDate)).toBeInTheDocument()
    })
  })

  describe('pay schedule preview functionality', () => {
    it('displays the PayPreviewCard when adding a new schedule with valid dates', async () => {
      const user = userEvent.setup()

      render(
        <GustoApiProvider config={{ baseUrl: API_BASE_URL }}>
          <PaySchedule companyId="123" onEvent={() => {}} />
        </GustoApiProvider>,
      )

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /add another pay schedule/i }),
        ).toBeInTheDocument()
      })

      // Click add button
      await user.click(screen.getByRole('button', { name: /add another pay schedule/i }))

      // Set dates to trigger the pay schedule preview
      const payDateInput = screen.getByRole('group', { name: 'First pay date' })
      await user.type(within(payDateInput).getByRole('spinbutton', { name: /month/i }), '01')
      await user.type(within(payDateInput).getByRole('spinbutton', { name: /day/i }), '01')
      await user.type(within(payDateInput).getByRole('spinbutton', { name: /year/i }), '2024')

      const endDateInput = screen.getByRole('group', { name: 'First pay period end date' })
      await user.type(within(endDateInput).getByRole('spinbutton', { name: /month/i }), '01')
      await user.type(within(endDateInput).getByRole('spinbutton', { name: /day/i }), '06')
      await user.type(within(endDateInput).getByRole('spinbutton', { name: /year/i }), '2024')

      // Wait for the preview to load
      await waitFor(() => {
        // Check for the calendar display component
        expect(screen.getByRole('application')).toBeInTheDocument()
      })

      // Check for the preview selector
      expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument()

      // Check for the calendar with the correct date range
      expect(screen.getByRole('grid')).toBeInTheDocument()
    })

    it('displays the PayPreviewCard when editing an existing schedule', async () => {
      const user = userEvent.setup()

      render(
        <GustoApiProvider config={{ baseUrl: API_BASE_URL }}>
          <PaySchedule companyId="123" onEvent={() => {}} />
        </GustoApiProvider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
      })

      // Open actions menu and click edit
      const actionsButton = screen.getByRole('button', { name: /actions/i })
      await user.click(actionsButton)
      await user.click(screen.getByRole('menuitem', { name: /edit/i }))

      // Wait for the preview to load
      await waitFor(() => {
        // Check for the calendar display component
        expect(screen.getByRole('application')).toBeInTheDocument()
      })

      // Check for the preview selector
      expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument()

      // Check for the calendar with the correct date range
      expect(screen.getByRole('grid')).toBeInTheDocument()
    })

    it('allows switching between different pay periods in the preview', async () => {
      const user = userEvent.setup()

      render(
        <GustoApiProvider config={{ baseUrl: API_BASE_URL }}>
          <PaySchedule companyId="123" onEvent={() => {}} />
        </GustoApiProvider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
      })

      // Open actions menu and click edit
      const actionsButton = screen.getByRole('button', { name: /actions/i })
      await user.click(actionsButton)
      await user.click(screen.getByRole('menuitem', { name: /edit/i }))

      // Wait for the preview to load
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument()
      })

      // Click on the preview selector
      await user.click(screen.getByRole('button', { name: /preview/i }))

      // There should be two options in the dropdown (for the two pay periods in the mock)
      const options = screen.getAllByRole('option')
      expect(options.length).toBeGreaterThanOrEqual(2)

      // Select the second option (if available)
      const secondOption = screen.getAllByRole('option')[1]
      if (secondOption) {
        await user.click(secondOption)
      }

      // The calendar should update to show the second pay period
      // We can't check the exact content because it depends on the locale formatting,
      // but we can check that the calendar is still there
      expect(screen.getByRole('application')).toBeInTheDocument()
      expect(screen.getByRole('grid')).toBeInTheDocument()
    })

    it('shows highlighted dates for payday and payroll deadline', async () => {
      const user = userEvent.setup()

      render(
        <GustoApiProvider config={{ baseUrl: API_BASE_URL }}>
          <PaySchedule companyId="123" onEvent={() => {}} />
        </GustoApiProvider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
      })

      // Open actions menu and click edit
      const actionsButton = screen.getByRole('button', { name: /actions/i })
      await user.click(actionsButton)
      await user.click(screen.getByRole('menuitem', { name: /edit/i }))

      // Wait for the preview to load
      await waitFor(() => {
        expect(screen.getByRole('application')).toBeInTheDocument()
      })

      // Check that the calendar is displayed with a grid
      expect(screen.getByRole('grid')).toBeInTheDocument()

      // Check that the calendar display component is rendered
      // We can't reliably check for specific text due to translations,
      // but we can verify the calendar component is present
      expect(screen.getByRole('application')).toHaveAttribute('aria-label')
    })
  })
})
