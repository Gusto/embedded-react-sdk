import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
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

const paymentConfigsMock = http.get(
  `${API_BASE_URL}/v1/companies/:company_uuid/payment_configs`,
  () => {
    return HttpResponse.json({
      payment_speed: '2-day',
      fast_payment_limit: 5000000,
    })
  },
)

async function waitForFormToLoad() {
  await waitFor(() => {
    expect(screen.queryByLabelText(/name/i)).toBeInTheDocument()
  })
}

describe('PaySchedule', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(paymentConfigsMock)
  })

  describe('navigation behavior', () => {
    it('navigates directly to form when there are no pay schedules', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules`, () =>
          HttpResponse.json([]),
        ),
        getPaySchedulePreview,
        createPaySchedule,
      )

      render(
        <GustoApiProvider config={{ baseUrl: API_BASE_URL }}>
          <PaySchedule companyId="123" onEvent={() => {}} />
        </GustoApiProvider>,
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /add pay schedule/i })).toBeInTheDocument()
      })

      await waitForFormToLoad()

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /frequency/i })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: /first pay date/i })).toBeInTheDocument()

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()

      expect(screen.queryByText('Weekly Schedule')).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /add another pay schedule/i }),
      ).not.toBeInTheDocument()
    })

    it('shows list when there are existing pay schedules', async () => {
      server.use(getPaySchedules, getPaySchedulePreview, createPaySchedule, updatePaySchedule)

      render(
        <GustoApiProvider config={{ baseUrl: API_BASE_URL }}>
          <PaySchedule companyId="123" onEvent={() => {}} />
        </GustoApiProvider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
      })

      const header = screen.getByRole('banner')
      expect(header).toBeInTheDocument()
      expect(within(header).getByRole('heading')).toHaveTextContent(/set up pay schedule/i)

      expect(screen.getByRole('button', { name: /add another pay schedule/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()

      expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument()
    })
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

      await waitFor(() => {
        expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
      })

      const header = screen.getByRole('banner')
      expect(header).toBeInTheDocument()
      expect(within(header).getByRole('heading')).toHaveTextContent(/set up pay schedule/i)
      expect(screen.getByText(/laws around when you must pay/i)).toBeInTheDocument()

      expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()

      expect(screen.getByRole('button', { name: /add another pay schedule/i })).toBeInTheDocument()

      expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument()
    })

    it('transitions to ADD_PAY_SCHEDULE mode with correct components', async () => {
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

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /add pay schedule/i })).toBeInTheDocument()
      })

      await waitForFormToLoad()

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /frequency/i })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: /first pay date/i })).toBeInTheDocument()

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()

      expect(screen.queryByText('Weekly Schedule')).not.toBeInTheDocument()
    })

    it('transitions to EDIT_PAY_SCHEDULE mode with correct components', async () => {
      const user = userEvent.setup()

      render(
        <GustoApiProvider config={{ baseUrl: API_BASE_URL }}>
          <PaySchedule companyId="123" onEvent={() => {}} />
        </GustoApiProvider>,
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /actions/i })).toBeInTheDocument()
      })

      const actionsButton = screen.getByRole('button', { name: /actions/i })
      await user.click(actionsButton)
      await user.click(screen.getByRole('menuitem', { name: /edit/i }))

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /edit pay schedule/i })).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByDisplayValue('Weekly Schedule')).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /every week/i })).toBeInTheDocument()

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()

      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('returns to LIST_PAY_SCHEDULES mode when canceling add/edit', async () => {
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
      await waitForFormToLoad()
      await user.click(screen.getByRole('button', { name: /cancel/i }))

      await waitFor(() => {
        expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
      })

      const actionsButton = screen.getByRole('button', { name: /actions/i })
      await user.click(actionsButton)
      await user.click(screen.getByRole('menuitem', { name: /edit/i }))
      await waitForFormToLoad()
      await user.click(screen.getByRole('button', { name: /cancel/i }))

      await waitFor(() => {
        expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
      })
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

      const actionsButton = screen.getByRole('button', { name: /actions/i })
      await user.click(actionsButton)
      await user.click(screen.getByRole('menuitem', { name: /edit/i }))

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /edit pay schedule/i })).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByDisplayValue('Weekly Schedule')).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/name/i), ' Updated')
      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
      })

      expect(onEvent).toHaveBeenCalledWith(componentEvents.PAY_SCHEDULE_UPDATED, expect.any(Object))
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

      await user.click(screen.getByRole('button', { name: /add another pay schedule/i }))
      await waitForFormToLoad()

      await user.type(screen.getByLabelText(/name/i), 'New Schedule')

      const frequencySelect = screen.getByRole('button', { name: /frequency/i })
      await user.click(frequencySelect)
      await user.click(screen.getByRole('option', { name: /every week/i }))

      const payDateInput = screen.getByRole('group', { name: 'First pay date' })
      await user.type(within(payDateInput).getByRole('spinbutton', { name: /month/i }), '01')
      await user.type(within(payDateInput).getByRole('spinbutton', { name: /day/i }), '01')
      await user.type(within(payDateInput).getByRole('spinbutton', { name: /year/i }), '2025')

      const endDateInput = screen.getByRole('group', { name: 'First pay period end date' })
      await user.type(within(endDateInput).getByRole('spinbutton', { name: /month/i }), '01')
      await user.type(within(endDateInput).getByRole('spinbutton', { name: /day/i }), '07')
      await user.type(within(endDateInput).getByRole('spinbutton', { name: /year/i }), '2025')

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
      })

      expect(onEvent).toHaveBeenCalledWith(componentEvents.PAY_SCHEDULE_CREATED, expect.any(Object))
    }, 10000)
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
      await waitForFormToLoad()

      expect(screen.getByDisplayValue(defaultValues.customName)).toBeInTheDocument()

      const payDateInput = screen.getByRole('group', { name: 'First pay date' })
      const yearInput = within(payDateInput).getByRole('spinbutton', { name: /year/i })
      const monthInput = within(payDateInput).getByRole('spinbutton', { name: /month/i })
      const dayInput = within(payDateInput).getByRole('spinbutton', { name: /day/i })

      expect(yearInput).toHaveValue(2024)
      expect(monthInput).toHaveValue(1)
      expect(dayInput).toHaveValue(1)
    })
  })

  describe('event callbacks', () => {
    beforeEach(() => {
      server.use(getPaySchedules, getPaySchedulePreview, createPaySchedule, updatePaySchedule)
    })

    it('fires PAY_SCHEDULE_DONE when continue is clicked', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()

      render(
        <GustoApiProvider config={{ baseUrl: API_BASE_URL }}>
          <PaySchedule companyId="123" onEvent={onEvent} />
        </GustoApiProvider>,
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /continue/i }))

      expect(onEvent).toHaveBeenCalledWith(componentEvents.PAY_SCHEDULE_DONE, undefined)
    })

    it('propagates navigation events when transitioning between views', async () => {
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

      await user.click(screen.getByRole('button', { name: /add another pay schedule/i }))
      await waitForFormToLoad()

      expect(onEvent).toHaveBeenCalledWith(componentEvents.PAY_SCHEDULE_CREATE, undefined)

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(onEvent).toHaveBeenCalledWith(componentEvents.CANCEL, undefined)
    })
  })

  describe('frequency-dependent field visibility', () => {
    beforeEach(() => {
      server.use(getPaySchedules, getPaySchedulePreview, createPaySchedule, updatePaySchedule)
    })

    it('shows frequency options radio group only for "Twice per month"', async () => {
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
      await waitForFormToLoad()

      expect(screen.queryByText(/frequency options/i)).not.toBeInTheDocument()

      const frequencySelect = screen.getByRole('button', { name: /frequency/i })
      await user.click(frequencySelect)
      await user.click(screen.getByRole('option', { name: /twice per month/i }))

      expect(screen.getByText(/frequency options/i)).toBeInTheDocument()
      expect(screen.getByText(/15th and last day of the month/i)).toBeInTheDocument()
      expect(screen.getByText(/custom/i)).toBeInTheDocument()
    })

    it('hides frequency options radio group for "Every week"', async () => {
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
      await waitForFormToLoad()

      const frequencySelect = screen.getByRole('button', { name: /frequency/i })
      await user.click(frequencySelect)
      await user.click(screen.getByRole('option', { name: /every week/i }))

      expect(screen.queryByText(/frequency options/i)).not.toBeInTheDocument()
    })

    it('hides frequency options radio group for "Monthly"', async () => {
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
      await waitForFormToLoad()

      const frequencySelect = screen.getByRole('button', { name: /frequency/i })
      await user.click(frequencySelect)
      await user.click(screen.getByRole('option', { name: /monthly/i }))

      expect(screen.queryByText(/frequency options/i)).not.toBeInTheDocument()
    })
  })

  describe('form field rendering', () => {
    it('renders all form fields in ADD mode', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules`, () =>
          HttpResponse.json([]),
        ),
        getPaySchedulePreview,
        createPaySchedule,
      )

      render(
        <GustoApiProvider config={{ baseUrl: API_BASE_URL }}>
          <PaySchedule companyId="123" onEvent={() => {}} />
        </GustoApiProvider>,
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /add pay schedule/i })).toBeInTheDocument()
      })

      await waitForFormToLoad()

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /frequency/i })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: /first pay date/i })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: /first pay period end date/i })).toBeInTheDocument()

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('renders edit form with existing schedule data populated', async () => {
      const user = userEvent.setup()
      server.use(getPaySchedules, getPaySchedulePreview, createPaySchedule, updatePaySchedule)

      render(
        <GustoApiProvider config={{ baseUrl: API_BASE_URL }}>
          <PaySchedule companyId="123" onEvent={() => {}} />
        </GustoApiProvider>,
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /actions/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /actions/i }))
      await user.click(screen.getByRole('menuitem', { name: /edit/i }))

      await waitFor(() => {
        expect(screen.getByDisplayValue('Weekly Schedule')).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /every week/i })).toBeInTheDocument()

      const payDateInput = screen.getByRole('group', { name: 'First pay date' })
      expect(within(payDateInput).getByRole('spinbutton', { name: /year/i })).toHaveValue(2024)
      expect(within(payDateInput).getByRole('spinbutton', { name: /month/i })).toHaveValue(1)
      expect(within(payDateInput).getByRole('spinbutton', { name: /day/i })).toHaveValue(1)

      const endDateInput = screen.getByRole('group', { name: 'First pay period end date' })
      expect(within(endDateInput).getByRole('spinbutton', { name: /year/i })).toHaveValue(2024)
      expect(within(endDateInput).getByRole('spinbutton', { name: /month/i })).toHaveValue(1)
      expect(within(endDateInput).getByRole('spinbutton', { name: /day/i })).toHaveValue(7)
    })

    it('shows preview placeholder alert when no dates are set', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules`, () =>
          HttpResponse.json([]),
        ),
        getPaySchedulePreview,
        createPaySchedule,
      )

      render(
        <GustoApiProvider config={{ baseUrl: API_BASE_URL }}>
          <PaySchedule companyId="123" onEvent={() => {}} />
        </GustoApiProvider>,
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /add pay schedule/i })).toBeInTheDocument()
      })

      await waitForFormToLoad()

      expect(screen.getByText(/pay schedule preview/i)).toBeInTheDocument()
      expect(screen.getByText(/complete all the required fields/i)).toBeInTheDocument()
    })
  })

  describe('submission behavior', () => {
    it('returns to list mode after successful create', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()

      server.use(getPaySchedules, getPaySchedulePreview, createPaySchedule, updatePaySchedule)

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

      await user.click(screen.getByRole('button', { name: /add another pay schedule/i }))
      await waitForFormToLoad()

      await user.type(screen.getByLabelText(/name/i), 'New Schedule')

      const payDateInput = screen.getByRole('group', { name: 'First pay date' })
      await user.type(within(payDateInput).getByRole('spinbutton', { name: /month/i }), '01')
      await user.type(within(payDateInput).getByRole('spinbutton', { name: /day/i }), '01')
      await user.type(within(payDateInput).getByRole('spinbutton', { name: /year/i }), '2025')

      const endDateInput = screen.getByRole('group', { name: 'First pay period end date' })
      await user.type(within(endDateInput).getByRole('spinbutton', { name: /month/i }), '01')
      await user.type(within(endDateInput).getByRole('spinbutton', { name: /day/i }), '07')
      await user.type(within(endDateInput).getByRole('spinbutton', { name: /year/i }), '2025')

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.PAY_SCHEDULE_CREATED,
          expect.any(Object),
        )
      })

      await waitFor(() => {
        expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
      })
    }, 15000)

    it('returns to list mode after successful update', async () => {
      const user = userEvent.setup()
      const onEvent = vi.fn()

      server.use(getPaySchedules, getPaySchedulePreview, createPaySchedule, updatePaySchedule)

      render(
        <GustoApiProvider config={{ baseUrl: API_BASE_URL }}>
          <PaySchedule companyId="123" onEvent={onEvent} />
        </GustoApiProvider>,
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /actions/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /actions/i }))
      await user.click(screen.getByRole('menuitem', { name: /edit/i }))

      await waitFor(() => {
        expect(screen.getByDisplayValue('Weekly Schedule')).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/name/i), ' Updated')
      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.PAY_SCHEDULE_UPDATED,
          expect.any(Object),
        )
      })

      await waitFor(() => {
        expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
      })
    })
  })

  describe('pay schedule preview functionality', () => {
    beforeEach(() => {
      server.use(getPaySchedules, getPaySchedulePreview, createPaySchedule, updatePaySchedule)
    })

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

      await user.click(screen.getByRole('button', { name: /add another pay schedule/i }))
      await waitForFormToLoad()

      const payDateInput = screen.getByRole('group', { name: 'First pay date' })
      await user.type(within(payDateInput).getByRole('spinbutton', { name: /month/i }), '01')
      await user.type(within(payDateInput).getByRole('spinbutton', { name: /day/i }), '01')
      await user.type(within(payDateInput).getByRole('spinbutton', { name: /year/i }), '2024')

      const endDateInput = screen.getByRole('group', { name: 'First pay period end date' })
      await user.type(within(endDateInput).getByRole('spinbutton', { name: /month/i }), '01')
      await user.type(within(endDateInput).getByRole('spinbutton', { name: /day/i }), '06')
      await user.type(within(endDateInput).getByRole('spinbutton', { name: /year/i }), '2024')

      await waitFor(() => {
        expect(screen.getByRole('application')).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument()
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

      const actionsButton = screen.getByRole('button', { name: /actions/i })
      await user.click(actionsButton)
      await user.click(screen.getByRole('menuitem', { name: /edit/i }))

      await waitFor(() => {
        expect(screen.getByRole('application')).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument()
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

      const actionsButton = screen.getByRole('button', { name: /actions/i })
      await user.click(actionsButton)
      await user.click(screen.getByRole('menuitem', { name: /edit/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /preview/i }))

      const options = screen.getAllByRole('option')
      expect(options.length).toBeGreaterThanOrEqual(2)

      const secondOption = screen.getAllByRole('option')[1]
      if (secondOption) {
        await user.click(secondOption)
      }

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

      const actionsButton = screen.getByRole('button', { name: /actions/i })
      await user.click(actionsButton)
      await user.click(screen.getByRole('menuitem', { name: /edit/i }))

      await waitFor(() => {
        expect(screen.getByRole('application')).toBeInTheDocument()
      })

      expect(screen.getByRole('grid')).toBeInTheDocument()
      expect(screen.getByRole('application')).toHaveAttribute('aria-label')
    })
  })
})
