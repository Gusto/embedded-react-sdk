import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { type Garnishment } from '@gusto/embedded-api/models/components/garnishment'
import { UNSTABLEDeductionsForm } from './UNSTABLE_DeductionsForm'
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
      <UNSTABLEDeductionsForm
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
      renderDeductionsForm([{ uuid: deductionId }], deductionId)

      await waitFor(() => {
        expect(screen.getByText('Edit Deduction')).toBeInTheDocument()
      })
    })

    it('can switch between garnishment or custom deduction', async () => {
      renderDeductionsForm()

      await waitFor(async () => {
        const garnishmentRadio = screen.getByLabelText('Garnishment (a court-ordered deduction)')

        await user.click(garnishmentRadio)

        // 1 p tag, and 1 input label
        expect(screen.getAllByText('Garnishment type').length).toEqual(2)

        const customRadio = screen.getByLabelText('Custom deduction (post-tax)')

        await user.click(customRadio)

        expect(customRadio).toBeChecked()
        expect(screen.getByText('Description')).toBeInTheDocument()
      })
    })

    it('can go back', async () => {
      renderDeductionsForm()

      await waitFor(async () => {
        const backButton = screen.getByRole('button', { name: 'Back to deductions' })

        expect(backButton).toBeInTheDocument()

        await user.click(backButton)

        expect(mockOnEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_DEDUCTION_CANCEL_EMPTY)
      })
    })
  })
})
