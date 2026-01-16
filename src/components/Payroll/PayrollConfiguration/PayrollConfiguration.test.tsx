import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { PayrollConfiguration } from './PayrollConfiguration'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'

const createEmployee = (uuid: string, firstName: string, lastName: string, rate = '25.00') => ({
  uuid,
  first_name: firstName,
  last_name: lastName,
  payment_method: 'Direct Deposit',
  jobs: [
    {
      uuid: `job-${uuid}`,
      title: 'Software Engineer',
      primary: true,
      compensations: [
        {
          uuid: `comp-${uuid}`,
          rate,
          payment_unit: 'Hour',
          flsa_status: 'Nonexempt',
        },
      ],
    },
  ],
})

const createCompensation = (employeeUuid: string, grossPay = 1000) => ({
  excluded: false,
  payment_method: 'Direct Deposit',
  memo: null,
  fixed_compensations: [],
  hourly_compensations: [
    {
      flsa_status: 'Nonexempt',
      name: 'Regular Hours',
      job_uuid: `job-${employeeUuid}`,
      amount: String(grossPay),
      compensation_multiplier: 1.0,
      hours: '40.000',
    },
  ],
  employee_uuid: employeeUuid,
  version: 'v1',
  paid_time_off: [],
  gross_pay: grossPay,
  net_pay: grossPay * 0.8,
  check_amount: grossPay * 0.8,
})

const page1Employees = [
  createEmployee('emp-1', 'Alice', 'Anderson'),
  createEmployee('emp-2', 'Bob', 'Baker'),
  createEmployee('emp-3', 'Charlie', 'Clark'),
  createEmployee('emp-4', 'Diana', 'Davis'),
  createEmployee('emp-5', 'Eve', 'Evans'),
  createEmployee('emp-6', 'Frank', 'Foster'),
  createEmployee('emp-7', 'Grace', 'Green'),
  createEmployee('emp-8', 'Henry', 'Harris'),
  createEmployee('emp-9', 'Ivy', 'Irving'),
  createEmployee('emp-10', 'Jack', 'Johnson'),
]

const page2Employees = [
  createEmployee('emp-11', 'Kate', 'King'),
  createEmployee('emp-12', 'Leo', 'Lewis'),
]

const allEmployees = [...page1Employees, ...page2Employees]

const allCompensations = allEmployees.map(emp => createCompensation(emp.uuid))

const mockPayrollData = {
  uuid: 'payroll-uuid-1',
  payroll_uuid: 'payroll-uuid-1',
  company_uuid: 'company-123',
  off_cycle: false,
  processed: false,
  check_date: '2025-08-15',
  payroll_deadline: '2025-08-11T17:00:00-07:00',
  pay_period: {
    start_date: '2025-07-30',
    end_date: '2025-08-13',
    pay_schedule_uuid: 'schedule-1',
  },
  employee_compensations: allCompensations,
  totals: {
    gross_pay: '4000.00',
    net_pay: '3200.00',
  },
  processing_request: null,
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

describe('PayrollConfiguration', () => {
  const onEvent = vi.fn()
  const defaultProps = {
    companyId: 'company-123',
    payrollId: 'payroll-uuid-1',
    onEvent,
  }

  beforeEach(() => {
    onEvent.mockClear()

    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:company_uuid/payrolls/blockers`, () => {
        return HttpResponse.json([])
      }),

      http.get(`${API_BASE_URL}/v1/companies/:company_id/employees`, ({ request }) => {
        const url = new URL(request.url)
        const page = parseInt(url.searchParams.get('page') || '1', 10)
        const per = parseInt(url.searchParams.get('per') || '10', 10)

        const allEmps = allEmployees
        const totalCount = allEmps.length
        const totalPages = Math.ceil(totalCount / per)

        const startIndex = (page - 1) * per
        const endIndex = startIndex + per
        const pageEmployees = allEmps.slice(startIndex, endIndex)

        return HttpResponse.json(pageEmployees, {
          headers: {
            'x-total-pages': String(totalPages),
            'x-total-count': String(totalCount),
            'x-page': String(page),
            'x-per-page': String(per),
          },
        })
      }),

      http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id`, () => {
        return HttpResponse.json(mockPayrollData)
      }),

      http.put(
        `${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/prepare`,
        async ({ request }) => {
          const body = (await request.json()) as { employee_uuids?: string[] } | null
          const employeeUuids = body?.employee_uuids

          if (employeeUuids && employeeUuids.length > 0) {
            const filteredCompensations = allCompensations.filter(comp =>
              employeeUuids.includes(comp.employee_uuid),
            )
            return HttpResponse.json({
              ...mockPayrollData,
              employee_compensations: filteredCompensations,
            })
          }

          return HttpResponse.json(mockPayrollData)
        },
      ),

      http.get(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules/:pay_schedule_id`, () => {
        return HttpResponse.json(mockPaySchedule)
      }),
    )
  })

  describe('initial render', () => {
    it('renders employee data correctly on initial load', async () => {
      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      expect(screen.getByText('Bob Baker')).toBeInTheDocument()
    })

    it('displays the payroll configuration page title', async () => {
      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      })
    })

    it('shows calculate payroll button', async () => {
      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /calculate/i })).toBeInTheDocument()
      })
    })
  })

  describe('pagination', () => {
    it('shows pagination controls when there are multiple pages', async () => {
      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      const nextButton = screen.getByTestId('pagination-next')
      expect(nextButton).toBeInTheDocument()
    })

    it('clicking next page shows different employees', async () => {
      const user = userEvent.setup()

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })
      expect(screen.getByText('Jack Johnson')).toBeInTheDocument()
      expect(screen.queryByText('Kate King')).not.toBeInTheDocument()

      const nextButton = screen.getByTestId('pagination-next')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Kate King')).toBeInTheDocument()
      })
      expect(screen.getByText('Leo Lewis')).toBeInTheDocument()
      expect(screen.queryByText('Alice Anderson')).not.toBeInTheDocument()
    })

    it('clicking previous page returns to prior data', async () => {
      const user = userEvent.setup()

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      const nextButton = screen.getByTestId('pagination-next')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Kate King')).toBeInTheDocument()
      })

      const prevButton = screen.getByTestId('pagination-previous')
      await user.click(prevButton)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })
      expect(screen.getByText('Bob Baker')).toBeInTheDocument()
    })

    it('employee compensations stay in sync with employee details across page changes', async () => {
      const user = userEvent.setup()

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })
      expect(screen.getByText('Jack Johnson')).toBeInTheDocument()

      const nextButton = screen.getByTestId('pagination-next')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Kate King')).toBeInTheDocument()
      })
      expect(screen.getByText('Leo Lewis')).toBeInTheDocument()
      expect(screen.queryByText('Alice Anderson')).not.toBeInTheDocument()
      expect(screen.queryByText('Jack Johnson')).not.toBeInTheDocument()
    })
  })
})
