import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { DeductionsCard } from './DeductionsCard'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { API_BASE_URL } from '@/test/constants'
import { componentEvents } from '@/shared/constants'

type GarnishmentFixture = {
  uuid: string
  active: boolean
  amount: string
  description: string
  recurring: boolean
  deduct_as_percentage: boolean
  court_ordered: boolean
  times: number | null
  annual_maximum: string | null
  pay_period_maximum: string | null
  total_amount: string | null
  version: string
}

const buildGarnishment = (
  overrides: Partial<GarnishmentFixture> & { uuid: string },
): GarnishmentFixture => ({
  active: true,
  amount: '50',
  description: 'Health Insurance',
  recurring: true,
  deduct_as_percentage: false,
  court_ordered: false,
  times: null,
  annual_maximum: null,
  pay_period_maximum: null,
  total_amount: null,
  version: `version-${overrides.uuid}`,
  ...overrides,
})

const stubGarnishmentsList = (garnishments: GarnishmentFixture[]) => {
  server.use(
    http.get(`${API_BASE_URL}/v1/employees/:employee_id/garnishments`, () =>
      HttpResponse.json(garnishments),
    ),
  )
}

vi.mock('@/hooks/useContainerBreakpoints/useContainerBreakpoints', async () => {
  const actual = await vi.importActual('@/hooks/useContainerBreakpoints/useContainerBreakpoints')
  return {
    ...actual,
    default: () => ['base', 'small', 'medium', 'large'],
    useContainerBreakpoints: () => ['base', 'small', 'medium', 'large'],
  }
})

describe('DeductionsCard (standalone)', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('renders the empty state when the employee has no active deductions', async () => {
    stubGarnishmentsList([])
    renderWithProviders(<DeductionsCard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('No deductions')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Add deduction' })).toBeInTheDocument()
  })

  it('renders the deductions list with active rows only', async () => {
    stubGarnishmentsList([
      buildGarnishment({ uuid: 'd-1', description: 'Health Insurance', amount: '120' }),
      buildGarnishment({ uuid: 'd-2', description: 'Retirement', recurring: false }),
      buildGarnishment({
        uuid: 'd-old',
        description: 'Old Deduction',
        active: false,
      }),
    ])
    renderWithProviders(<DeductionsCard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Health Insurance')).toBeInTheDocument()
    })
    expect(screen.getByText('Retirement')).toBeInTheDocument()
    expect(screen.queryByText('Old Deduction')).toBeNull()
  })

  it('fires EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_ADD_REQUESTED with the employeeId when Add deduction is clicked', async () => {
    stubGarnishmentsList([])
    const user = userEvent.setup()
    renderWithProviders(<DeductionsCard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add deduction' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Add deduction' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_ADD_REQUESTED,
      { employeeId: 'employee-123' },
    )
  })

  it('fires EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_EDIT_REQUESTED with the garnishment when Edit deduction is clicked', async () => {
    stubGarnishmentsList([
      buildGarnishment({ uuid: 'd-1', description: 'Health Insurance', amount: '120' }),
    ])
    const user = userEvent.setup()
    renderWithProviders(<DeductionsCard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Deduction actions menu' })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Deduction actions menu' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Edit deduction' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_EDIT_REQUESTED,
      expect.objectContaining({ uuid: 'd-1', description: 'Health Insurance' }),
    )
  })

  it('soft-deletes via PUT and fires EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_DELETED after the dialog is confirmed', async () => {
    const target = buildGarnishment({ uuid: 'd-1', description: 'Health Insurance' })
    stubGarnishmentsList([target])

    let updatePath: string | null = null
    let updateBody: Record<string, unknown> | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updatePath = new URL(request.url).pathname
      updateBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({ ...target, active: false })
    })
    server.use(http.put(`${API_BASE_URL}/v1/garnishments/:garnishment_id`, updateResolver))

    const user = userEvent.setup()
    renderWithProviders(<DeductionsCard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Deduction actions menu' })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Deduction actions menu' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Delete deduction' }))

    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(updateResolver).toHaveBeenCalledTimes(1)
    })
    expect(updatePath).toBe('/v1/garnishments/d-1')
    expect(updateBody).toMatchObject({ active: false, version: 'version-d-1' })
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_DELETED,
      expect.objectContaining({ uuid: 'd-1', active: false }),
    )
  })
})
