import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { createMachine } from 'robot3'
import { PaySchedule } from '../PaySchedule'
import { PayScheduleAssignment, PayScheduleAssignmentFlow } from './PayScheduleAssignment'
import { AssignmentScheduleStep } from './PayScheduleAssignmentComponents'
import { payScheduleAssignmentStateMachine } from './payScheduleAssignmentStateMachine'
import type { PayScheduleAssignmentContextInterface } from './usePayScheduleAssignment'
import { BaseComponent } from '@/components/Base'
import { server } from '@/test/mocks/server'
import { componentEvents } from '@/shared/constants'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { getFixture } from '@/test/mocks/fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

const companyPath = `${API_BASE_URL}/v1/companies/:company_id`
const schedules = [
  { uuid: 'weekly', version: 'v1', frequency: 'Every week', custom_name: 'Weekly', active: true },
  { uuid: 'monthly', version: 'v2', frequency: 'Monthly', custom_name: 'Monthly', active: false },
]
function employee(index: number) {
  return {
    uuid: `employee-${index}`,
    first_name: 'Employee',
    last_name: String(index),
    payment_method: 'Check',
    onboarded: true,
    historical: false,
    terminated: false,
    jobs: [
      {
        uuid: `job-${index}`,
        title: 'Engineer',
        compensations: [{ uuid: `compensation-${index}`, flsa_status: 'Nonexempt' }],
      },
    ],
  }
}
const employees = Array.from({ length: 7 }, (_, index) => employee(index + 1))
const savedAssignment = {
  type: 'by_employee',
  employees: employees.map((entry, index) => ({
    employee_uuid: entry.uuid,
    pay_schedule_uuid: index === 0 ? 'monthly' : 'weekly',
  })),
}
function renderAssignment() {
  const onEvent = vi.fn()
  const result = renderWithProviders(<PayScheduleAssignment companyId="123" onEvent={onEvent} />, {
    unstableFeatures: { managePaySchedules: true },
  })
  return { ...result, onEvent }
}
async function enterEmployees(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('radio', { name: /^by employee/i }))
  await user.click(screen.getByRole('button', { name: /continue/i }))
  await screen.findByRole('button', { name: /pay schedule for employee 1/i })
}
async function choose(user: ReturnType<typeof userEvent.setup>, index: number, schedule: RegExp) {
  await user.click(
    await screen.findByRole('button', {
      name: new RegExp(`pay schedule for employee ${index}$`, 'i'),
    }),
  )
  await user.click(screen.getByRole('option', { name: schedule }))
}

describe('employee pay schedule assignment', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(
      http.get(`${companyPath}/departments`, () => HttpResponse.json([])),
      http.get(`${companyPath}/employees`, () => HttpResponse.json(employees)),
      http.get(`${companyPath}/pay_schedules`, () => HttpResponse.json(schedules)),
      http.get(`${companyPath}/pay_schedules/assignments`, () =>
        HttpResponse.json(savedAssignment),
      ),
      http.post(`${companyPath}/pay_schedules/assignment_preview`, () =>
        HttpResponse.json({ employee_changes: [] }),
      ),
      http.post(
        `${companyPath}/pay_schedules/assign`,
        () => new HttpResponse(null, { status: 200 }),
      ),
    )
  })

  it('prefills saved choices and retains edits across pagination and Back', async () => {
    const user = userEvent.setup()
    renderAssignment()
    expect(await screen.findByRole('radio', { name: /^by employee/i })).toBeChecked()
    await enterEmployees(user)
    expect(screen.getByRole('button', { name: /pay schedule for employee 1$/i })).toHaveTextContent(
      'Monthly',
    )
    await choose(user, 2, /monthly/i)
    await user.click(screen.getByTestId('pagination-next'))
    await choose(user, 7, /monthly/i)
    await user.click(screen.getByTestId('pagination-previous'))
    expect(screen.getByRole('button', { name: /pay schedule for employee 2$/i })).toHaveTextContent(
      'Monthly',
    )
    await user.click(screen.getByRole('button', { name: /^back$/i }))
    await user.click(await screen.findByRole('button', { name: /continue/i }))
    expect(
      await screen.findByRole('button', { name: /pay schedule for employee 2$/i }),
    ).toHaveTextContent('Monthly')
    await user.click(screen.getByTestId('pagination-next'))
    expect(screen.getByRole('button', { name: /pay schedule for employee 7$/i })).toHaveTextContent(
      'Monthly',
    )
  })

  it.each([false, true])(
    'previews and saves the complete identical assignment, collapsed=%s',
    async collapse => {
      let previewBody: unknown
      let assignBody: unknown
      const preview = vi.fn<HttpResponseResolver>(async ({ request }) => {
        previewBody = await request.json()
        return HttpResponse.json({ employee_changes: [] })
      })
      const assign = vi.fn<HttpResponseResolver>(async ({ request }) => {
        assignBody = await request.json()
        return new HttpResponse(null, { status: 200 })
      })
      server.use(
        http.post(`${companyPath}/pay_schedules/assignment_preview`, preview),
        http.post(`${companyPath}/pay_schedules/assign`, assign),
      )
      const user = userEvent.setup()
      const { onEvent } = renderAssignment()
      await enterEmployees(user)
      if (collapse) await choose(user, 1, /weekly/i)
      await user.click(screen.getByRole('button', { name: /continue/i }))
      await screen.findByRole('button', { name: /submit/i })
      expect(previewBody).toEqual(
        collapse ? { type: 'single', default_pay_schedule_uuid: 'weekly' } : savedAssignment,
      )
      expect(assign).not.toHaveBeenCalled()
      await user.click(screen.getByRole('button', { name: /submit/i }))
      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.PAY_SCHEDULE_ASSIGNED,
          expect.objectContaining({
            type: collapse ? 'single' : 'by_employee',
            employeeChanges: [],
          }),
        )
      })
      expect(assignBody).toEqual(previewBody)
      expect(assign).toHaveBeenCalledTimes(1)
      expect(onEvent.mock.calls.some(([type]) => type === 'assignmentDraftUpdated')).toBe(false)
    },
  )

  it('retains choices through Add pay schedule cancellation and review Back', async () => {
    const user = userEvent.setup()
    renderAssignment()
    await enterEmployees(user)
    await choose(user, 2, /monthly/i)
    await user.click(screen.getByRole('button', { name: /add pay schedule/i }))
    await user.click(await screen.findByRole('button', { name: /cancel/i }))
    expect(
      await screen.findByRole('button', { name: /pay schedule for employee 2$/i }),
    ).toHaveTextContent('Monthly')
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.click(await screen.findByRole('button', { name: /^back$/i }))
    expect(
      await screen.findByRole('button', { name: /pay schedule for employee 2$/i }),
    ).toHaveTextContent('Monthly')
  })

  it('keeps the draft and makes a newly created schedule available without replacing selections', async () => {
    let created = false
    server.use(
      http.get(`${companyPath}/pay_schedules`, () =>
        HttpResponse.json(
          created
            ? [
                ...schedules,
                {
                  uuid: 'new-schedule',
                  version: 'v3',
                  frequency: 'Every week',
                  custom_name: 'New Schedule',
                  active: false,
                },
              ]
            : schedules,
        ),
      ),
      http.post(`${companyPath}/pay_schedules`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        created = true
        return HttpResponse.json(
          {
            ...(await getFixture('post-v1-companies-company_id-pay_schedules')),
            ...body,
            uuid: 'new-schedule',
          },
          { status: 201 },
        )
      }),
    )
    const user = userEvent.setup()
    renderAssignment()
    await enterEmployees(user)
    await choose(user, 2, /monthly/i)
    await user.click(screen.getByRole('button', { name: /add pay schedule/i }))
    await user.type(await screen.findByLabelText(/name/i), 'New Schedule')
    await user.click(screen.getByRole('button', { name: /frequency/i }))
    await user.click(screen.getByRole('option', { name: /every week/i }))
    for (const [label, day] of [
      ['First pay date', '01'],
      ['First pay period end date', '07'],
    ]) {
      const group = screen.getByRole('group', { name: label })
      await user.type(within(group).getByRole('spinbutton', { name: /month/i }), '01')
      await user.type(within(group).getByRole('spinbutton', { name: /day/i }), day!)
      await user.type(within(group).getByRole('spinbutton', { name: /year/i }), '2025')
    }
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(
      await screen.findByRole('button', { name: /pay schedule for employee 2$/i }),
    ).toHaveTextContent('Monthly')
    expect(screen.getByRole('button', { name: /pay schedule for employee 3$/i })).toHaveTextContent(
      'Weekly',
    )
    await user.click(screen.getByRole('button', { name: /pay schedule for employee 2$/i }))
    expect(screen.getByRole('option', { name: /new schedule/i })).toBeInTheDocument()
  })

  it.each([
    [{ type: 'single', default_pay_schedule_uuid: 'monthly' }, 'Monthly', 'Monthly'],
    [
      {
        type: 'hourly_salaried',
        hourly_pay_schedule_uuid: 'weekly',
        salaried_pay_schedule_uuid: 'monthly',
      },
      'Weekly',
      'Monthly',
    ],
    [
      {
        type: 'by_department',
        default_pay_schedule_uuid: 'weekly',
        departments: [{ department_uuid: 'sales', pay_schedule_uuid: 'monthly' }],
      },
      'Monthly',
      'Weekly',
    ],
  ])(
    'prefills current schedules when switching from $type to employees',
    async (assignment, firstSchedule, secondSchedule) => {
      server.use(
        http.get(`${companyPath}/pay_schedules/assignments`, () => HttpResponse.json(assignment)),
        http.get(`${companyPath}/employees`, () =>
          HttpResponse.json([
            { ...employee(1), department_uuid: 'sales' },
            { ...employee(2), flsa_status: 'Exempt' },
          ]),
        ),
      )
      const user = userEvent.setup()
      renderAssignment()
      await enterEmployees(user)
      expect(
        screen.getByRole('button', { name: /pay schedule for employee 1$/i }),
      ).toHaveTextContent(firstSchedule)
      expect(
        screen.getByRole('button', { name: /pay schedule for employee 2$/i }),
      ).toHaveTextContent(secondSchedule)
    },
  )

  it('waits for later pages before treating the roster as empty', async () => {
    let resolvePage!: (value: Response) => void
    const laterPage = new Promise<Response>(resolve => {
      resolvePage = resolve
    })
    server.use(
      http.get(`${companyPath}/employees`, ({ request }) =>
        new URL(request.url).searchParams.get('page') === '1'
          ? HttpResponse.json([], { headers: { 'x-total-pages': '2' } })
          : laterPage,
      ),
    )
    renderAssignment()
    expect(await screen.findByRole('status', { name: /loading/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /add pay schedule/i })).not.toBeInTheDocument()
    resolvePage(HttpResponse.json([employee(1)]))
    expect(await screen.findByRole('radio', { name: /^by employee/i })).toBeChecked()
  })

  it('filters ineligible employees before rendering and submitting', async () => {
    const ineligible = [
      { ...employee(20), terminated: true },
      { ...employee(21), historical: true },
      { ...employee(22), onboarded: false },
      { ...employee(23), jobs: [] },
      { ...employee(24), jobs: [{ uuid: 'no-comp', title: 'Engineer', compensations: [] }] },
    ]
    server.use(
      http.get(`${companyPath}/employees`, () => HttpResponse.json([employee(1), ...ineligible])),
    )
    const user = userEvent.setup()
    renderAssignment()
    await enterEmployees(user)
    expect(screen.getAllByRole('button', { name: /pay schedule for employee/i })).toHaveLength(1)
    expect(screen.queryByTestId('pagination-next')).not.toBeInTheDocument()
  })

  it('loads every API page before exposing employee assignment, including an eligible employee only on page two', async () => {
    const list = vi.fn<HttpResponseResolver>(({ request }) => {
      const page = new URL(request.url).searchParams.get('page')
      return HttpResponse.json(
        page === '1' ? [{ ...employee(10), historical: true }] : [employee(1)],
        { headers: { 'x-total-pages': '2' } },
      )
    })
    server.use(http.get(`${companyPath}/employees`, list))
    const user = userEvent.setup()
    renderAssignment()
    await enterEmployees(user)
    expect(
      new Set(
        list.mock.calls.map(([{ request }]) => new URL(request.url).searchParams.get('page')),
      ),
    ).toEqual(new Set(['1', '2']))
    expect(screen.getAllByRole('button', { name: /pay schedule for employee/i })).toHaveLength(1)
  })

  it('does not collapse based only on the first API page', async () => {
    server.use(
      http.get(`${companyPath}/employees`, ({ request }) =>
        HttpResponse.json(
          new URL(request.url).searchParams.get('page') === '1' ? [employee(2)] : [employee(1)],
          { headers: { 'x-total-pages': '2' } },
        ),
      ),
    )
    const user = userEvent.setup()
    let previewBody: unknown
    server.use(
      http.post(`${companyPath}/pay_schedules/assignment_preview`, async ({ request }) => {
        previewBody = await request.json()
        return HttpResponse.json({ employee_changes: [] })
      }),
    )
    renderAssignment()
    await enterEmployees(user)
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await screen.findByRole('button', { name: /submit/i })
    expect(previewBody).toEqual({
      type: 'by_employee',
      employees: [savedAssignment.employees[1], savedAssignment.employees[0]],
    })
  })

  it('hides the employee option only after loading an empty assignable roster', async () => {
    server.use(
      http.get(`${companyPath}/employees`, () =>
        HttpResponse.json([{ ...employee(1), onboarded: false }]),
      ),
    )
    renderAssignment()
    expect(await screen.findByRole('radio', { name: /everyone on one schedule/i })).toBeChecked()
    expect(screen.queryByRole('radio', { name: /^by employee/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /add pay schedule/i })).not.toBeInTheDocument()
  })

  it('defensively enters schedule creation with single intent when employees disappear', async () => {
    server.use(http.get(`${companyPath}/employees`, () => HttpResponse.json([])))
    const machine = createMachine(
      'assignmentSchedule',
      payScheduleAssignmentStateMachine,
      (context: PayScheduleAssignmentContextInterface) => ({
        ...context,
        companyId: '123',
        assignmentType: 'by_employee' as const,
        component: AssignmentScheduleStep,
      }),
    )
    renderWithProviders(
      <BaseComponent onEvent={vi.fn()}>
        <PayScheduleAssignmentFlow companyId="123" machine={machine} onEvent={vi.fn()} />
      </BaseComponent>,
    )
    await screen.findByRole('heading', { name: /add pay schedule/i })
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(await screen.findByRole('button', { name: /weekly/i })).toBeInTheDocument()
  })

  it.each(['single', 'by_employee'])(
    'keeps other types available with missing employee scope for %s',
    async type => {
      server.use(
        http.get(`${companyPath}/pay_schedules/assignments`, () =>
          HttpResponse.json({ ...savedAssignment, type }),
        ),
        http.get(`${companyPath}/employees`, () =>
          HttpResponse.json(
            {
              errors: [
                {
                  category: 'missing_oauth_scopes',
                  metadata: { missing_scope_name: 'employees:read' },
                },
              ],
            },
            { status: 403 },
          ),
        ),
      )
      const user = userEvent.setup()
      renderAssignment()
      await screen.findByRole('alert')
      if (type === 'by_employee') {
        expect(screen.getByRole('radio', { name: /^by employee/i })).toBeChecked()
        expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled()
      }
      await user.click(screen.getByRole('radio', { name: /everyone on one schedule/i }))
      await user.click(screen.getByRole('button', { name: /continue/i }))
      expect(await screen.findByRole('button', { name: /weekly/i })).toBeInTheDocument()
    },
  )

  it.each([403, 500])('surfaces unexpected employee %s errors', async status => {
    server.use(http.get(`${companyPath}/employees`, () => new HttpResponse(null, { status })))
    renderAssignment()
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /add pay schedule/i })).not.toBeInTheDocument()
  })

  it('groups the overview by schedule with eligible employee counts and routes row editing', async () => {
    const onEvent = vi.fn()
    renderWithProviders(
      <PaySchedule companyId="123" onEvent={onEvent} enableAutoPilot enableMultipleSchedules />,
      { unstableFeatures: { managePaySchedules: true } },
    )
    await screen.findByRole('grid', { name: /pay schedules by employee/i })
    expect(screen.getByText('6 employees')).toBeInTheDocument()
    expect(screen.getByText('1 employee')).toBeInTheDocument()
    const row = screen.getByRole('row', { name: /monthly/i })
    const user = userEvent.setup()
    await user.click(within(row).getByRole('button', { name: /pay schedule actions/i }))
    await user.click(screen.getByRole('menuitem', { name: /edit schedule/i }))
    expect(onEvent).toHaveBeenCalledWith(componentEvents.PAY_SCHEDULE_UPDATE, { uuid: 'monthly' })
  })

  it('keeps Manage available when employee access is missing from an existing employee assignment', async () => {
    server.use(
      http.get(`${companyPath}/employees`, () =>
        HttpResponse.json({ errors: [{ category: 'missing_oauth_scopes' }] }, { status: 403 }),
      ),
    )
    renderWithProviders(<PaySchedule companyId="123" onEvent={vi.fn()} enableMultipleSchedules />, {
      unstableFeatures: { managePaySchedules: true },
    })
    await screen.findByRole('alert')
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /manage/i }))
    expect(await screen.findByRole('radio', { name: /^by employee/i })).toBeChecked()
    await user.click(screen.getByRole('radio', { name: /everyone on one schedule/i }))
    await user.click(screen.getByRole('button', { name: /continue/i }))
    expect(await screen.findByRole('button', { name: /weekly/i })).toBeInTheDocument()
  })

  it('honors overview feature options and opens Manage on employee assignment', async () => {
    const { unmount } = renderWithProviders(<PaySchedule companyId="123" onEvent={vi.fn()} />, {
      unstableFeatures: { managePaySchedules: true },
    })
    await screen.findByRole('grid', { name: /pay schedules by employee/i })
    expect(screen.queryByRole('button', { name: /manage/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/autopilot/i)).not.toBeInTheDocument()
    unmount()
    renderWithProviders(<PaySchedule companyId="123" onEvent={vi.fn()} enableMultipleSchedules />, {
      unstableFeatures: { managePaySchedules: true },
    })
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /manage/i }))
    expect(await screen.findByRole('radio', { name: /^by employee/i })).toBeChecked()
  })
})
