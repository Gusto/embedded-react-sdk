import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { TerminationFlow } from './TerminationFlow'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'
import {
  mockEmployee,
  mockTerminationCancelable,
  mockTerminationPayPeriods,
  mockPayrollPrepared,
} from '@/test/mocks/apis/terminations'

describe('TerminationFlow', () => {
  const onEvent = vi.fn()
  const defaultProps = {
    companyId: 'company-123',
    employeeId: 'employee-123',
    onEvent,
  }

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(
      http.get(`${API_BASE_URL}/v1/employees/:employee_id`, () => {
        return HttpResponse.json(mockEmployee)
      }),
      http.post(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
        return HttpResponse.json(mockTerminationCancelable)
      }),
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
        return HttpResponse.json([mockTerminationCancelable])
      }),
      http.delete(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
        return new HttpResponse(null, { status: 204 })
      }),
      http.get(
        `${API_BASE_URL}/v1/companies/:company_id/pay_periods/unprocessed_termination_pay_periods`,
        () => {
          return HttpResponse.json(mockTerminationPayPeriods)
        },
      ),
      http.post(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, () => {
        return HttpResponse.json(mockPayrollPrepared)
      }),
    )
  })

  describe('initial render', () => {
    it('renders the termination form as the initial state', async () => {
      renderWithProviders(<TerminationFlow {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Terminate John Doe' })).toBeInTheDocument()
      })

      expect(screen.getByText('Last day of work')).toBeInTheDocument()
      expect(screen.getByText('Dismissal payroll')).toBeInTheDocument()
    })
  })

  describe('flow transitions', () => {
    it('transitions from form to summary after cancel and back', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return HttpResponse.json([mockTerminationCancelable])
        }),
      )

      renderWithProviders(<TerminationFlow {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Terminate John Doe' })).toBeInTheDocument()
      })
    })
  })

  describe('accessibility', () => {
    it('should not have any accessibility violations on form state', async () => {
      const { container } = renderWithProviders(<TerminationFlow {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Terminate John Doe' })).toBeInTheDocument()
      })

      await expectNoAxeViolations(container, { isIntegrationTest: true })
    })
  })
})
