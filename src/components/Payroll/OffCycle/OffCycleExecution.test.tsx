import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { useMemo } from 'react'
import { createMachine } from 'robot3'
import type { OffCycleFlowContextInterface } from './OffCycleFlowComponents'
import { OffCycleExecutionContextual } from './OffCycleFlowComponents'
import { offCycleMachine, offCycleBreadcrumbsNodes } from './offCycleStateMachine'
import { Flow } from '@/components/Flow/Flow'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'

const EMPLOYEE_UUID = 'emp-uuid-1'
const COMPANY_ID = 'company-123'
const PAYROLL_ID = 'payroll-uuid-1'

const mockPayrollData = {
  uuid: PAYROLL_ID,
  payroll_uuid: PAYROLL_ID,
  company_uuid: COMPANY_ID,
  off_cycle: true,
  off_cycle_reason: 'Bonus',
  processed: false,
  check_date: '2025-08-15',
  external: false,
  payroll_deadline: '2025-08-11T17:00:00-07:00',
  pay_period: {
    start_date: '2025-07-30',
    end_date: '2025-08-13',
    pay_schedule_uuid: 'schedule-1',
  },
  employee_compensations: [
    {
      excluded: false,
      payment_method: 'Direct Deposit',
      memo: null,
      fixed_compensations: [],
      hourly_compensations: [
        {
          flsa_status: 'Nonexempt',
          name: 'Regular Hours',
          job_uuid: 'job-1',
          amount: '880.0',
          compensation_multiplier: 1.0,
          hours: '40.000',
        },
      ],
      employee_uuid: EMPLOYEE_UUID,
      version: 'v1',
      paid_time_off: [],
      gross_pay: 880.0,
      net_pay: 700.0,
      check_amount: 700.0,
    },
  ],
  totals: {
    gross_pay: '880.00',
    net_pay: '700.00',
    company_debit: '880.00',
    net_pay_debit: '700.00',
    tax_debit: '180.00',
    reimbursement_debit: '0.00',
    child_support_debit: '0.00',
    reimbursements: '0.00',
    employee_bonuses: '0.00',
    employee_commissions: '0.00',
    employee_cash_tips: '0.00',
    employee_paycheck_tips: '0.00',
    additional_earnings: '0.00',
    owners_draw: '0.00',
    check_amount: '0.00',
    employer_taxes: '90.00',
    employee_taxes: '90.00',
    benefits: '0.00',
    employee_benefits_deductions: '0.00',
    deferred_payroll_taxes: '0.00',
    other_deductions: '0.00',
  },
  payroll_status_meta: {
    cancellable: true,
    payroll_late: false,
    initial_check_date: '2025-08-15',
    expected_check_date: '2025-08-15',
    expected_debit_time: '2025-08-11T17:00:00-07:00',
    initial_debit_cutoff_time: '2025-08-11T17:00:00-07:00',
  },
}

const mockEmployee = {
  uuid: EMPLOYEE_UUID,
  first_name: 'Jane',
  last_name: 'Doe',
  payment_method: 'Direct Deposit',
  jobs: [
    {
      uuid: 'job-1',
      title: 'Software Engineer',
      primary: true,
      compensations: [
        {
          uuid: 'comp-1',
          rate: '22.00',
          payment_unit: 'Hour',
          flsa_status: 'Nonexempt',
        },
      ],
    },
  ],
}

const mockPaySchedule = {
  uuid: 'schedule-1',
  frequency: 'Every week',
  anchor_pay_date: '2024-01-01',
  anchor_end_of_pay_period: '2024-01-07',
  custom_name: 'Weekly Schedule',
  active: true,
  version: 'v1',
}

function OffCycleFlowInExecutionState({ onEvent }: { onEvent: () => void }) {
  const offCycleFlowMachine = useMemo(
    () =>
      createMachine(
        'execution',
        offCycleMachine,
        (initialContext: OffCycleFlowContextInterface) => ({
          ...initialContext,
          component: OffCycleExecutionContextual,
          companyId: COMPANY_ID,
          payrollUuid: PAYROLL_ID,
          breadcrumbs: buildBreadcrumbs(offCycleBreadcrumbsNodes),
          currentBreadcrumbId: 'createOffCyclePayroll',
          progressBarType: null,
        }),
      ),
    [],
  )

  return <Flow machine={offCycleFlowMachine} onEvent={onEvent} />
}

function setupMswHandlers(options?: { onPrepare?: () => void }) {
  server.use(
    http.get(`${API_BASE_URL}/v1/companies/:company_uuid/payrolls/blockers`, () => {
      return HttpResponse.json([])
    }),

    http.get(`${API_BASE_URL}/v1/companies/:company_id/employees`, () => {
      return HttpResponse.json([mockEmployee], {
        headers: {
          'x-total-pages': '1',
          'x-total-count': '1',
          'x-page': '1',
          'x-per-page': '10',
        },
      })
    }),

    http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id`, () => {
      return HttpResponse.json(mockPayrollData)
    }),

    http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/prepare`, () => {
      options?.onPrepare?.()
      return HttpResponse.json(mockPayrollData)
    }),

    http.get(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules/:pay_schedule_id`, () => {
      return HttpResponse.json(mockPaySchedule)
    }),

    http.get(`${API_BASE_URL}/v1/employees/:employee_id`, () => {
      return HttpResponse.json(mockEmployee)
    }),

    http.get(`${API_BASE_URL}/v1/employees/:employee_id/bank_accounts`, () => {
      return HttpResponse.json([])
    }),
  )
}

describe('OffCycleExecution - prepare call stability', () => {
  let prepareCallCount: number

  beforeEach(() => {
    prepareCallCount = 0
    setupMswHandlers({
      onPrepare: () => {
        prepareCallCount++
      },
    })
  })

  it('calls prepare only once when transitioning to edit employee in off-cycle flow', async () => {
    const user = userEvent.setup()
    const onEvent = vi.fn()

    renderWithProviders(<OffCycleFlowInExecutionState onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    })

    const configurationPrepareCount = prepareCallCount

    const editButton = await screen.findByRole('button', { name: 'Edit' })
    await user.click(editButton)
    const editMenuItem = await screen.findByRole('menuitem', { name: 'Edit' })
    await user.click(editMenuItem)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /edit payroll for jane doe/i }),
      ).toBeInTheDocument()
    })

    const editEmployeePrepareCount = prepareCallCount - configurationPrepareCount

    expect(editEmployeePrepareCount).toBe(1)
  })
})

describe('OffCycleExecution - edit employee hours round-trip', () => {
  const UPDATED_HOURS = '20.000'

  beforeEach(() => {
    let hoursAfterUpdate = '40.000'

    setupMswHandlers()

    server.use(
      http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/prepare`, () => {
        return HttpResponse.json({
          ...mockPayrollData,
          employee_compensations: [
            {
              ...mockPayrollData.employee_compensations[0],
              hourly_compensations: [
                {
                  ...mockPayrollData.employee_compensations[0]!.hourly_compensations[0],
                  hours: hoursAfterUpdate,
                },
              ],
            },
          ],
        })
      }),

      http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id`, () => {
        hoursAfterUpdate = UPDATED_HOURS
        return HttpResponse.json({
          ...mockPayrollData,
          employee_compensations: [
            {
              ...mockPayrollData.employee_compensations[0],
              hourly_compensations: [
                {
                  ...mockPayrollData.employee_compensations[0]!.hourly_compensations[0],
                  hours: UPDATED_HOURS,
                },
              ],
            },
          ],
        })
      }),
    )
  })

  it('shows updated hours on configuration after editing and saving employee', async () => {
    const user = userEvent.setup()
    const onEvent = vi.fn()

    renderWithProviders(<OffCycleFlowInExecutionState onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    })
    expect(screen.getByText('40.0')).toBeInTheDocument()

    const editButton = await screen.findByRole('button', { name: 'Edit' })
    await user.click(editButton)
    const editMenuItem = await screen.findByRole('menuitem', { name: 'Edit' })
    await user.click(editMenuItem)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /edit payroll for jane doe/i }),
      ).toBeInTheDocument()
    })

    const regularHoursInput = await screen.findByLabelText('Regular Hours')
    await user.clear(regularHoursInput)
    await user.type(regularHoursInput, '20')

    const saveButton = screen.getByRole('button', { name: 'Save' })
    await user.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText('20.0')).toBeInTheDocument()
    })
  })
})
