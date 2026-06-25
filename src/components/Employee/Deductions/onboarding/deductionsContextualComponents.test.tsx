import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import {
  DeductionsListContextual,
  type DeductionsContextInterface,
} from './deductionsContextualComponents'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'
import { FlowContext } from '@/components/Flow/useFlow'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { API_BASE_URL } from '@/test/constants'

function renderInFlow(node: React.ReactNode, onEvent: DeductionsContextInterface['onEvent']) {
  const ctx: DeductionsContextInterface = {
    component: null,
    onEvent,
    employeeId: 'employee-123',
  }
  return renderWithProviders(<FlowContext.Provider value={ctx}>{node}</FlowContext.Provider>)
}

describe('DeductionsListContextual', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    setupApiTestMocks()
  })

  it('fires ADD when the empty-state "Add deduction" is clicked', async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/garnishments`, () =>
        HttpResponse.json([]),
      ),
    )

    const onEvent = vi.fn()
    renderInFlow(<DeductionsListContextual />, onEvent)

    await waitFor(() => {
      expect(screen.getByText("You haven't added any deductions yet")).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Add deduction' }))

    expect(onEvent).toHaveBeenCalledTimes(1)
    expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_DEDUCTION_ADD)
  })
})
