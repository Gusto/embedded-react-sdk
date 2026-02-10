import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { type Garnishment } from '@gusto/embedded-api/models/components/garnishment'
import { DeductionsForm } from './DeductionsForm'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { getEmployeeGarnishments } from '@/test/mocks/apis/employees'
import { server } from '@/test/mocks/server'
import { API_BASE_URL } from '@/test/constants'

vi.mock('@/hooks/useContainerBreakpoints/useContainerBreakpoints', async () => {
  const actual = await vi.importActual('@/hooks/useContainerBreakpoints/useContainerBreakpoints')
  return {
    ...actual,
    default: () => ['base', 'small', 'medium', 'large'],
    useContainerBreakpoints: () => ['base', 'small', 'medium', 'large'],
  }
})

describe('DeductionsForm', () => {
  const user = userEvent.setup()
  const mockOnEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    server.use(getEmployeeGarnishments)
  })

  const renderDeductionsForm = (
    deductions: Garnishment[] = [],
    deductionId: string | null = null,
  ) => {
    server.use(
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/garnishments`, () => {
        return HttpResponse.json(deductions)
      }),
    )

    server.use(
      http.get(`${API_BASE_URL}/v1/garnishments/child_support`, () => {
        return HttpResponse.json({
          agencies: [
            {
              state: 'AK',
              name: 'Alaska Child Support Services Division',
              manual_payment_required: false,
              fips_codes: [
                {
                  county: null,
                  code: '0200000',
                },
              ],
              required_attributes: [
                {
                  key: 'case_number',
                  label: 'CSE Case Number',
                },
              ],
            },
          ],
        })
      }),
    )

    return renderWithProviders(
      <DeductionsForm
        employeeId="test-employee-id"
        onEvent={mockOnEvent}
        deductionId={deductionId}
      />,
    )
  }

  describe('DeductionsForm', () => {
    it('renders in add mode', async () => {
      renderDeductionsForm()

      await waitFor(() => {
        expect(screen.getByText('Add Deduction')).toBeInTheDocument()
      })
    })

    it('renders in edit mode', async () => {
      const deductionId = 'i am deduction'
      renderDeductionsForm(
        [
          {
            uuid: deductionId,
            active: true,
            times: null,
            recurring: true,
            annualMaximum: null,
            totalAmount: null,
            deductAsPercentage: true,
            courtOrdered: true,
            payPeriodMaximum: null,
          },
        ],
        deductionId,
      )

      await waitFor(() => {
        expect(screen.getByText('Edit Deduction')).toBeInTheDocument()
      })
    })

    it('can switch between garnishment or custom deduction', async () => {
      renderDeductionsForm()

      const garnishmentRadio = await screen.findByLabelText(
        'Garnishment (a court-ordered deduction)',
      )
      await user.click(garnishmentRadio)

      await waitFor(() => {
        expect(screen.getAllByText('Garnishment type').length).toEqual(2)
      })

      const customRadio = screen.getByLabelText('Custom deduction (post-tax)')
      await user.click(customRadio)

      expect(customRadio).toBeChecked()
      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('can switch between garnishment types', async () => {
      renderDeductionsForm()

      const garnishmentRadio = await screen.findByLabelText(
        'Garnishment (a court-ordered deduction)',
      )
      await user.click(garnishmentRadio)

      await waitFor(() => {
        expect(screen.getAllByText('Garnishment type').length).toEqual(2)
      })

      expect(screen.getByLabelText('Child Support')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Child Support Garnishment type' }))
      await user.click(screen.getByRole('option', { name: 'Federal Tax Lien' }))

      await waitFor(() => {
        expect(screen.getByLabelText('Federal Tax Lien')).toBeInTheDocument()
      })
    })

    it('can go back to empty state when canceling with no deductions', async () => {
      renderDeductionsForm()

      await waitFor(() => {
        expect(screen.getByLabelText('Agency')).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      await user.click(cancelButton)

      expect(mockOnEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_DEDUCTION_CANCEL_EMPTY)
    })

    it('calls EMPLOYEE_DEDUCTION_CANCEL when Cancel is clicked with existing deductions', async () => {
      const existingDeductionId = 'existing-deduction'
      renderDeductionsForm(
        [
          {
            uuid: existingDeductionId,
            active: true,
            times: null,
            recurring: true,
            annualMaximum: null,
            totalAmount: null,
            deductAsPercentage: true,
            courtOrdered: true,
            payPeriodMaximum: null,
          },
        ],
        null,
      )

      await waitFor(() => {
        expect(screen.getByLabelText('Agency')).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      await user.click(cancelButton)

      expect(mockOnEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_DEDUCTION_CANCEL)
    })
  })
})
