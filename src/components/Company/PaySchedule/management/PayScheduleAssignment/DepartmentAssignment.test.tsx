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
const departments = [
  { uuid: 'engineering', title: 'Engineering' },
  { uuid: 'sales', title: 'Sales' },
]
const schedules = [
  { uuid: 'weekly', version: 'v1', frequency: 'Every week', custom_name: 'Weekly', active: true },
  { uuid: 'monthly', version: 'v2', frequency: 'Monthly', custom_name: 'Monthly', active: false },
]
const savedAssignment = {
  type: 'by_department',
  default_pay_schedule_uuid: 'weekly',
  departments: [
    { department_uuid: 'engineering', pay_schedule_uuid: 'monthly' },
    { department_uuid: 'sales', pay_schedule_uuid: 'weekly' },
  ],
}

function renderAssignment() {
  const onEvent = vi.fn()
  renderWithProviders(<PayScheduleAssignment companyId="123" onEvent={onEvent} />, {
    unstableFeatures: { managePaySchedules: true },
  })
  return onEvent
}

async function enterDepartments(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('radio', { name: /by department/i }))
  await user.click(screen.getByRole('button', { name: /continue/i }))
  await screen.findByRole('button', { name: /engineering/i })
}

async function selectSchedule(
  user: ReturnType<typeof userEvent.setup>,
  field: RegExp,
  option: RegExp,
) {
  await user.click(await screen.findByRole('button', { name: field }))
  await user.click(screen.getByRole('option', { name: option }))
}

describe('department pay schedule assignment', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(
      http.get(`${companyPath}/departments`, () => HttpResponse.json(departments)),
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

  it('prefills the stored department assignments and default, and preserves them through review and Back', async () => {
    const user = userEvent.setup()
    renderAssignment()
    expect(await screen.findByRole('radio', { name: /by department/i })).toBeChecked()
    await enterDepartments(user)
    expect(screen.getByRole('button', { name: /engineering/i })).toHaveTextContent('Monthly')
    expect(screen.getByRole('button', { name: /sales/i })).toHaveTextContent('Weekly')
    expect(screen.getByRole('button', { name: /uncategorized employees/i })).toHaveTextContent(
      'Weekly',
    )
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.click(await screen.findByRole('button', { name: /back/i }))
    expect(await screen.findByRole('button', { name: /engineering/i })).toHaveTextContent('Monthly')
  })

  it.each([
    ['different department schedules', false, false, savedAssignment],
    [
      'all departments and default on one schedule',
      true,
      false,
      { type: 'single', default_pay_schedule_uuid: 'weekly' },
    ],
    [
      'same departments but a different default',
      true,
      true,
      {
        type: 'by_department',
        default_pay_schedule_uuid: 'monthly',
        departments: departments.map(department => ({
          department_uuid: department.uuid,
          pay_schedule_uuid: 'weekly',
        })),
      },
    ],
  ])(
    'previews and submits the same request: %s',
    async (_label, sameDepartments, differentDefault, expectedBody) => {
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
      const onEvent = renderAssignment()
      await enterDepartments(user)
      if (sameDepartments) await selectSchedule(user, /engineering/i, /weekly/i)
      if (differentDefault) await selectSchedule(user, /uncategorized employees/i, /monthly/i)
      await user.click(screen.getByRole('button', { name: /continue/i }))
      await screen.findByRole('button', { name: /submit/i })
      expect(previewBody).toEqual(expectedBody)
      expect(assign).not.toHaveBeenCalled()
      await user.click(screen.getByRole('button', { name: /submit/i }))
      await waitFor(() => {
        expect(assign).toHaveBeenCalledTimes(1)
      })
      expect(assignBody).toEqual(previewBody)
      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.PAY_SCHEDULE_ASSIGNED,
          expect.objectContaining({ type: expectedBody.type, employeeChanges: [] }),
        )
      })
    },
  )

  it('preserves unsaved department selections when adding a schedule is cancelled', async () => {
    const user = userEvent.setup()
    renderAssignment()
    await enterDepartments(user)
    await selectSchedule(user, /sales/i, /monthly/i)
    await user.click(screen.getByRole('button', { name: /add pay schedule/i }))
    await screen.findByRole('heading', { name: /add pay schedule/i })
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(await screen.findByRole('button', { name: /sales/i })).toHaveTextContent('Monthly')
    expect(screen.getByRole('button', { name: /engineering/i })).toHaveTextContent('Monthly')
    expect(screen.getByRole('button', { name: /uncategorized employees/i })).toHaveTextContent(
      'Weekly',
    )
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
    await enterDepartments(user)
    await selectSchedule(user, /sales/i, /monthly/i)
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
    expect(await screen.findByRole('button', { name: /sales/i })).toHaveTextContent('Monthly')
    expect(screen.getByRole('button', { name: /uncategorized employees/i })).toHaveTextContent(
      'Weekly',
    )
    await user.click(screen.getByRole('button', { name: /sales/i }))
    expect(screen.getByRole('option', { name: /new schedule/i })).toBeInTheDocument()
  })

  it('preserves selections after returning to the type selector, and clears them when changing type', async () => {
    const user = userEvent.setup()
    renderAssignment()
    await enterDepartments(user)
    await selectSchedule(user, /sales/i, /monthly/i)
    await user.click(screen.getByRole('button', { name: /back/i }))
    await user.click(await screen.findByRole('button', { name: /continue/i }))
    expect(await screen.findByRole('button', { name: /sales/i })).toHaveTextContent('Monthly')
    await user.click(screen.getByRole('button', { name: /back/i }))
    await user.click(await screen.findByRole('radio', { name: /everyone on one schedule/i }))
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.click(await screen.findByRole('button', { name: /back/i }))
    await enterDepartments(user)
    expect(screen.getByRole('button', { name: /sales/i })).toHaveTextContent('Weekly')
    expect(screen.getByRole('button', { name: /engineering/i })).toHaveTextContent('Weekly')
  })

  it('hides the department option for an empty company without redirecting', async () => {
    server.use(http.get(`${companyPath}/departments`, () => HttpResponse.json([])))
    renderAssignment()
    expect(await screen.findByRole('radio', { name: /everyone on one schedule/i })).toBeChecked()
    expect(screen.queryByRole('radio', { name: /by department/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /add pay schedule/i })).not.toBeInTheDocument()
  })

  it('opens the creation form with single intent when department assignment is entered without departments', async () => {
    server.use(http.get(`${companyPath}/departments`, () => HttpResponse.json([])))
    const machine = createMachine(
      'assignmentSchedule',
      payScheduleAssignmentStateMachine,
      (context: PayScheduleAssignmentContextInterface) => ({
        ...context,
        companyId: '123',
        assignmentType: 'by_department' as const,
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
    expect(screen.queryByRole('button', { name: /engineering/i })).not.toBeInTheDocument()
  })

  it('keeps loading departments distinct from an empty list', async () => {
    let resolveDepartments!: (value: Response) => void
    const response = new Promise<Response>(resolve => {
      resolveDepartments = resolve
    })
    server.use(http.get(`${companyPath}/departments`, () => response))
    renderAssignment()
    expect(await screen.findByRole('status', { name: /loading/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /add pay schedule/i })).not.toBeInTheDocument()
    resolveDepartments(HttpResponse.json(departments))
    expect(await screen.findByRole('radio', { name: /by department/i })).toBeInTheDocument()
  })

  it.each([403, 500])(
    'surfaces an unexpected %s department response instead of treating it as empty',
    async status => {
      server.use(http.get(`${companyPath}/departments`, () => new HttpResponse(null, { status })))
      renderAssignment()
      expect(await screen.findByRole('alert')).toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: /add pay schedule/i })).not.toBeInTheDocument()
    },
  )

  it.each(['single', 'hourly_salaried', 'by_department'])(
    'keeps other choices available when department scope is missing for %s',
    async type => {
      server.use(
        http.get(`${companyPath}/pay_schedules/assignments`, () =>
          HttpResponse.json({ ...savedAssignment, type }),
        ),
        http.get(`${companyPath}/departments`, () =>
          HttpResponse.json(
            {
              errors: [
                {
                  category: 'missing_oauth_scopes',
                  metadata: { missing_scope_name: 'departments:read' },
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
      if (type === 'by_department') {
        expect(screen.getByRole('radio', { name: /by department/i })).toBeChecked()
        expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled()
      }
      await user.click(screen.getByRole('radio', { name: /everyone on one schedule/i }))
      await user.click(screen.getByRole('button', { name: /continue/i }))
      expect(await screen.findByRole('button', { name: /weekly/i })).toBeInTheDocument()
    },
  )

  it.each(['back', 'add pay schedule'])(
    'preserves hourly and salaried selections after %s',
    async action => {
      const user = userEvent.setup()
      const onEvent = renderAssignment()
      await user.click(await screen.findByRole('radio', { name: /compensation type/i }))
      await user.click(screen.getByRole('button', { name: /continue/i }))
      await selectSchedule(user, /hourly/i, /monthly/i)
      await user.click(screen.getByRole('button', { name: new RegExp(`^${action}$`, 'i') }))
      if (action === 'back') {
        await user.click(await screen.findByRole('button', { name: /continue/i }))
      } else {
        await user.click(await screen.findByRole('button', { name: /cancel/i }))
      }
      expect(await screen.findByRole('button', { name: /hourly/i })).toHaveTextContent('Monthly')
      expect(screen.getByRole('button', { name: /salaried/i })).toHaveTextContent('Weekly')
      expect(onEvent.mock.calls.some(([type]) => type === 'assignmentDraftUpdated')).toBe(false)
    },
  )

  it('renders the department overview and routes Manage back to saved assignments', async () => {
    renderWithProviders(
      <PaySchedule companyId="123" onEvent={vi.fn()} enableAutoPilot enableMultipleSchedules />,
      {
        unstableFeatures: { managePaySchedules: true },
      },
    )
    await screen.findByRole('grid', { name: /pay schedules by department/i })
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('Sales')).toBeInTheDocument()
    expect(screen.getByText('Uncategorized employees')).toBeInTheDocument()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /manage/i }))
    expect(await screen.findByRole('radio', { name: /by department/i })).toBeChecked()
  })
  it('edits the schedule selected from a department row', async () => {
    const onEvent = vi.fn()
    renderWithProviders(
      <PaySchedule companyId="123" onEvent={onEvent} enableAutoPilot enableMultipleSchedules />,
      { unstableFeatures: { managePaySchedules: true } },
    )
    const row = await screen.findByRole('row', { name: 'Engineering' })
    const user = userEvent.setup()
    await user.click(within(row).getByRole('button', { name: /pay schedule actions/i }))
    await user.click(screen.getByRole('menuitem', { name: /edit schedule/i }))
    expect(onEvent).toHaveBeenCalledWith(componentEvents.PAY_SCHEDULE_UPDATE, { uuid: 'monthly' })
    expect(await screen.findByRole('heading', { name: /edit pay schedule/i })).toBeInTheDocument()
  })

  it('hides Manage and AutoPilot in the department overview when disabled', async () => {
    renderWithProviders(<PaySchedule companyId="123" onEvent={vi.fn()} />, {
      unstableFeatures: { managePaySchedules: true },
    })
    const row = await screen.findByRole('row', { name: 'Engineering' })
    expect(screen.queryByRole('button', { name: /manage/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/autopilot/i)).not.toBeInTheDocument()
    const user = userEvent.setup()
    await user.click(within(row).getByRole('button', { name: /pay schedule actions/i }))
    expect(screen.getAllByRole('menuitem')).toHaveLength(1)
  })
})
