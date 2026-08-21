import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PrintChecksBanner } from './PrintChecksBanner'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const checkCompensation = {
  employeeUuid: 'emp-check-1',
  excluded: false,
  paymentMethod: 'Check',
}

let mockEmployeeCompensations: Record<string, unknown>[] = []
let mockProcessed = false
let mockProcessingStatus: string | undefined

vi.mock('@gusto/embedded-api/react-query/payrollsGet', () => ({
  usePayrollsGet: () => ({
    data: {
      payrollShow: {
        processed: mockProcessed,
        processingRequest: mockProcessingStatus ? { status: mockProcessingStatus } : undefined,
        employeeCompensations: mockEmployeeCompensations,
      },
    },
  }),
}))

describe('PrintChecksBanner', () => {
  const onEvent = vi.fn()
  const onStartPrintChecks = vi.fn()
  const user = userEvent.setup()

  const defaultProps = {
    companyId: 'company-1',
    payrollId: 'payroll-1',
    onStartPrintChecks,
    onEvent,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockEmployeeCompensations = []
    mockProcessed = false
    mockProcessingStatus = undefined
  })

  it('renders nothing when no employees are paid by check', () => {
    renderWithProviders(<PrintChecksBanner {...defaultProps} />)

    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('shows the alert without a CTA when the payroll has not been processed', async () => {
    mockEmployeeCompensations = [checkCompensation]

    renderWithProviders(<PrintChecksBanner {...defaultProps} />)

    expect(await screen.findByText(/noted 1 employee/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'View and print checks' })).toBeNull()
  })

  it('shows the CTA once the payroll is processed, and fires onStartPrintChecks when clicked', async () => {
    mockEmployeeCompensations = [checkCompensation]
    mockProcessed = true

    renderWithProviders(<PrintChecksBanner {...defaultProps} />)

    const cta = await screen.findByRole('button', { name: 'View and print checks' })
    await user.click(cta)

    expect(onStartPrintChecks).toHaveBeenCalledTimes(1)
  })

  it('shows the CTA when the processing request succeeded even if processed is not yet true', async () => {
    mockEmployeeCompensations = [checkCompensation]
    mockProcessingStatus = 'submit_success'

    renderWithProviders(<PrintChecksBanner {...defaultProps} />)

    expect(await screen.findByRole('button', { name: 'View and print checks' })).toBeInTheDocument()
  })

  it('excludes compensations marked as excluded from the count', () => {
    mockEmployeeCompensations = [{ ...checkCompensation, excluded: true }]

    renderWithProviders(<PrintChecksBanner {...defaultProps} />)

    expect(screen.queryByRole('alert')).toBeNull()
  })
})
