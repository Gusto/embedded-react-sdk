import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { DismissalFlow } from './DismissalFlow'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'

vi.mock('../PayrollExecutionFlow/PayrollExecutionFlow', () => ({
  PayrollExecutionFlow: (props: Record<string, unknown>) => (
    <div
      data-testid="payroll-execution-flow"
      data-is-dismissal-payroll={props.isDismissalPayroll === true ? 'true' : 'false'}
    >
      PayrollExecutionFlow
    </div>
  ),
}))

describe('DismissalFlowComponents', () => {
  beforeEach(() => {
    setupApiTestMocks()

    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id`, () => {
        return HttpResponse.json({
          payroll_uuid: 'payroll-123',
          company_uuid: 'company-123',
          pay_period: {
            start_date: '2026-03-01',
            end_date: '2026-03-15',
          },
        })
      }),
    )
  })

  it('passes isDismissalPayroll to PayrollExecutionFlow', async () => {
    renderWithProviders(
      <DismissalFlow
        companyId="company-123"
        employeeId="employee-123"
        payrollId="payroll-123"
        onEvent={vi.fn()}
      />,
    )

    await waitFor(() => {
      expect(screen.getByTestId('payroll-execution-flow')).toBeInTheDocument()
    })

    expect(screen.getByTestId('payroll-execution-flow')).toHaveAttribute(
      'data-is-dismissal-payroll',
      'true',
    )
  })
})
