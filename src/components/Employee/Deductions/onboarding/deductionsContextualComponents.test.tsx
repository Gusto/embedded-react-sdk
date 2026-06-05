import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  IncludeDeductionsContextual,
  type DeductionsContextInterface,
} from './deductionsContextualComponents'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'
import { FlowContext } from '@/components/Flow/useFlow'

function renderInFlow(node: React.ReactNode, onEvent: DeductionsContextInterface['onEvent']) {
  const ctx: DeductionsContextInterface = {
    component: null,
    onEvent,
    employeeId: 'employee-123',
  }
  return renderWithProviders(<FlowContext.Provider value={ctx}>{node}</FlowContext.Provider>)
}

describe('IncludeDeductionsContextual', () => {
  const user = userEvent.setup()

  it('fires INCLUDE_YES when "Add deduction" is clicked', async () => {
    const onEvent = vi.fn()
    renderInFlow(<IncludeDeductionsContextual />, onEvent)

    await waitFor(() => {
      expect(screen.getByText('Deductions')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Add deduction' }))

    expect(onEvent).toHaveBeenCalledTimes(1)
    expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_DEDUCTION_INCLUDE_YES)
  })

  it('fires INCLUDE_NO and then DONE when "Continue" is clicked', async () => {
    const onEvent = vi.fn()
    renderInFlow(<IncludeDeductionsContextual />, onEvent)

    await user.click(await screen.findByRole('button', { name: 'Continue' }))

    // Both events must fire on Continue: INCLUDE_NO is the public-contract
    // event partners listen for, and DONE is what the outer onboarding flow
    // needs to advance to the next step. The legacy inner state machine
    // routed INCLUDE_NO through a terminal state that fired DONE; the new
    // flat shape emits both directly.
    expect(onEvent).toHaveBeenCalledTimes(2)
    expect(onEvent).toHaveBeenNthCalledWith(1, componentEvents.EMPLOYEE_DEDUCTION_INCLUDE_NO)
    expect(onEvent).toHaveBeenNthCalledWith(2, componentEvents.EMPLOYEE_DEDUCTION_DONE)
  })
})
