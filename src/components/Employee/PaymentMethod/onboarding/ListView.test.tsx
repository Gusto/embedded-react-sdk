import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PaymentMethod } from './PaymentMethod'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { server } from '@/test/mocks/server'
import {
  getEmptyEmployeeBankAccounts,
  getEmptyEmployeePaymentMethod,
} from '@/test/mocks/apis/employeesBankAccounts'

vi.mock('@/hooks/useContainerBreakpoints/useContainerBreakpoints', async () => {
  const actual = await vi.importActual('@/hooks/useContainerBreakpoints/useContainerBreakpoints')
  return {
    ...actual,
    default: () => ['base', 'small', 'medium', 'large'],
    useContainerBreakpoints: () => ['base', 'small', 'medium', 'large'],
  }
})

describe('PaymentMethod onboarding ListView', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('renders payment method type selector and bank accounts', async () => {
    renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(
      () => {
        expect(screen.getByRole('radio', { name: /direct deposit/i })).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    expect(screen.getByRole('radio', { name: /check/i })).toBeInTheDocument()
    expect(screen.getByText('Chase')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('shows Add bank account button when direct deposit is selected', async () => {
    renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(
      () => {
        expect(screen.getByRole('radio', { name: /direct deposit/i })).toBeChecked()
      },
      { timeout: 5000 },
    )

    expect(screen.getByRole('button', { name: /add another bank account/i })).toBeInTheDocument()
  })

  it('hides Add bank account button when Check is selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(
      () => {
        expect(screen.getByRole('radio', { name: /check/i })).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    await user.click(screen.getByRole('radio', { name: /check/i }))

    expect(screen.queryByRole('button', { name: /add.*bank account/i })).not.toBeInTheDocument()
  })

  it('navigates to BankForm when Add bank account is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(
      () => {
        expect(
          screen.getByRole('button', { name: /add another bank account/i }),
        ).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    await user.click(screen.getByRole('button', { name: /add another bank account/i }))

    await waitFor(() => {
      expect(screen.getByLabelText('Account nickname')).toBeInTheDocument()
    })
  })

  it('fires EMPLOYEE_PAYMENT_METHOD_UPDATED and EMPLOYEE_PAYMENT_METHOD_DONE when Continue is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => {
      const firedTypes = onEvent.mock.calls.map(([type]) => type)
      expect(firedTypes).toContain(componentEvents.EMPLOYEE_PAYMENT_METHOD_UPDATED)
      expect(firedTypes).toContain(componentEvents.EMPLOYEE_PAYMENT_METHOD_DONE)
    })
  })

  it('does not show Add bank account button when no accounts exist and payment method is Check', async () => {
    server.use(getEmptyEmployeeBankAccounts, getEmptyEmployeePaymentMethod)

    renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(
      () => {
        expect(screen.getByRole('radio', { name: /direct deposit/i })).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    // With no accounts and Check payment method, add bank account is not shown
    expect(screen.queryByRole('button', { name: /add.*bank account/i })).not.toBeInTheDocument()
  })
})
