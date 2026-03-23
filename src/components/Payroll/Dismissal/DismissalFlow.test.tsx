import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { DismissalFlow } from './DismissalFlow'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

vi.mock('./DismissalFlowComponents', () => ({
  DismissalPayPeriodSelectionContextual: () => (
    <div data-testid="pay-period-selection">Pay Period Selection</div>
  ),
  DismissalExecutionContextual: () => <div data-testid="execution">Execution</div>,
}))

function renderDismissalFlow(props: Parameters<typeof DismissalFlow>[0]) {
  return renderWithProviders(<DismissalFlow {...props} />)
}

describe('DismissalFlow', () => {
  const defaultProps = {
    companyId: 'company-123',
    employeeId: 'employee-123',
    onEvent: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts in payPeriodSelection when no payrollId is provided', async () => {
    renderDismissalFlow(defaultProps)

    await waitFor(() => {
      expect(screen.getByTestId('pay-period-selection')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('execution')).not.toBeInTheDocument()
  })

  it('starts in execution when payrollId is provided', () => {
    renderDismissalFlow({ ...defaultProps, payrollId: 'payroll-123' })

    expect(screen.getByTestId('execution')).toBeInTheDocument()
    expect(screen.queryByTestId('pay-period-selection')).not.toBeInTheDocument()
  })

  it('starts in payPeriodSelection when payrollId is undefined', async () => {
    renderDismissalFlow({ ...defaultProps, payrollId: undefined })

    await waitFor(() => {
      expect(screen.getByTestId('pay-period-selection')).toBeInTheDocument()
    })
  })

  it('starts in payPeriodSelection when payrollId is empty string', async () => {
    renderDismissalFlow({ ...defaultProps, payrollId: '' })

    await waitFor(() => {
      expect(screen.getByTestId('pay-period-selection')).toBeInTheDocument()
    })
  })
})
