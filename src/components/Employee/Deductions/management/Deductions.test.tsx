import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Deductions } from './Deductions'
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

describe('Deductions (management block)', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('starts on the card surface and renders the deductions list', async () => {
    stubGarnishmentsList([
      buildGarnishment({ uuid: 'd-1', description: 'Health Insurance', amount: '120' }),
    ])
    renderWithProviders(<Deductions employeeId="employee-123" onEvent={onEvent} />)

    expect(await screen.findByRole('heading', { name: 'Deductions' })).toBeInTheDocument()
    expect(await screen.findByText('Health Insurance')).toBeInTheDocument()
  })

  it('transitions card → editDeduction when Add deduction is clicked', async () => {
    stubGarnishmentsList([])
    const user = userEvent.setup()
    renderWithProviders(<Deductions employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add deduction' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Add deduction' }))

    expect(await screen.findByRole('heading', { name: 'Add Deduction' })).toBeInTheDocument()
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_ADD_REQUESTED,
      { employeeId: 'employee-123' },
    )
  })

  it('transitions card → editDeduction when an existing deduction is edited', async () => {
    stubGarnishmentsList([buildGarnishment({ uuid: 'd-1', description: 'Health Insurance' })])
    const user = userEvent.setup()
    renderWithProviders(<Deductions employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Deduction actions menu' })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Deduction actions menu' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Edit deduction' }))

    expect(await screen.findByRole('heading', { name: 'Edit Deduction' })).toBeInTheDocument()
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_EDIT_REQUESTED,
      expect.objectContaining({ uuid: 'd-1' }),
    )
  })

  it('returns to card surface when the edit form is cancelled', async () => {
    // Use edit mode so the variant is pre-selected and the Cancel button on
    // the inline form renders immediately (add mode requires picking a
    // variant first).
    stubGarnishmentsList([buildGarnishment({ uuid: 'd-1', description: 'Health Insurance' })])
    const user = userEvent.setup()
    renderWithProviders(<Deductions employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Deduction actions menu' })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Deduction actions menu' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Edit deduction' }))

    await user.click(await screen.findByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Deductions' })).toBeInTheDocument()
    })
    expect(screen.queryByRole('heading', { name: 'Edit Deduction' })).toBeNull()
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_EDIT_FORM_CANCELLED,
      undefined,
    )
  })

  it('renders the deductionDeleted alert after a soft-delete and dismisses on the X button', async () => {
    const target = buildGarnishment({ uuid: 'd-1', description: 'Health Insurance' })
    stubGarnishmentsList([target])
    server.use(
      http.put(`${API_BASE_URL}/v1/garnishments/:garnishment_id`, () =>
        HttpResponse.json({ ...target, active: false }),
      ),
    )

    const user = userEvent.setup()
    renderWithProviders(<Deductions employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Deduction actions menu' })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Deduction actions menu' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Delete deduction' }))

    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    const alert = await screen.findByText('Deduction successfully deleted.')
    expect(alert).toBeInTheDocument()
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_DELETED,
      expect.objectContaining({ uuid: 'd-1', active: false }),
    )

    await user.click(screen.getByRole('button', { name: /dismiss/i }))
    await waitFor(() => {
      expect(screen.queryByText('Deduction successfully deleted.')).toBeNull()
    })
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_ALERT_DISMISSED,
      null,
    )
  })
})
