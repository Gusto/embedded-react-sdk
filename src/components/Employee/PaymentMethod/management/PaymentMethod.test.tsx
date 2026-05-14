import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { PaymentMethod } from './PaymentMethod'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
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

describe('PaymentMethod (management)', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  describe('ListView', () => {
    it('renders the bank accounts list with fixture data', async () => {
      renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

      await waitFor(
        () => {
          expect(screen.getByText('Chase')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      expect(screen.getByRole('button', { name: /add another bank account/i })).toBeInTheDocument()
    })

    it('navigates to bank form when add bank account is clicked', async () => {
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
  })

  describe('BankForm', () => {
    it('renders bank account form fields when starting at add state', async () => {
      renderWithProviders(
        <PaymentMethod employeeId="employee-123" onEvent={onEvent} initialState="add" />,
      )

      await waitFor(() => {
        expect(screen.getByLabelText('Account nickname')).toBeInTheDocument()
      })

      expect(screen.getByLabelText('Routing number')).toBeInTheDocument()
      expect(screen.getByLabelText('Account number')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('creates a bank account and fires EMPLOYEE_BANK_ACCOUNT_CREATED', async () => {
      const user = userEvent.setup()
      // POST /v1/employees/:id/bank_accounts expects 201
      server.use(
        http.post(
          `${API_BASE_URL}/v1/employees/:employee_id/bank_accounts`,
          async ({ request }) => {
            const body = (await request.json()) as Record<string, unknown>
            return HttpResponse.json(
              {
                uuid: 'new-account-uuid',
                employee_uuid: 'employee-123',
                account_type: body['accountType'] as string,
                name: body['name'] as string,
                routing_number: body['routingNumber'] as string,
                hidden_account_number: 'XXXX6789',
              },
              { status: 201 },
            )
          },
        ),
      )

      renderWithProviders(
        <PaymentMethod employeeId="employee-123" onEvent={onEvent} initialState="add" />,
      )

      await waitFor(() => {
        expect(screen.getByLabelText('Account nickname')).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText('Account nickname'), 'Test Account')
      await user.type(screen.getByLabelText('Routing number'), '011401533')
      await user.type(screen.getByLabelText('Account number'), '123456789')
      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATED,
          expect.any(Object),
        )
      })
    })

    it('returns to list view when cancel is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <PaymentMethod employeeId="employee-123" onEvent={onEvent} initialState="add" />,
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      await waitFor(
        () => {
          expect(screen.getByText('Chase')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )
    })
  })

  describe('delete bank account', () => {
    it('shows delete dialog and fires EMPLOYEE_BANK_ACCOUNT_DELETED on confirm', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

      await waitFor(
        () => {
          expect(screen.getByText('Chase')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      await user.click(screen.getByRole('button', { name: 'Bank account actions' }))
      await user.click(screen.getByRole('menuitem', { name: 'Delete' }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Delete' }))

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.EMPLOYEE_BANK_ACCOUNT_DELETED,
          expect.anything(),
        )
      })
    })

    it('closes delete dialog without deleting when cancel is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PaymentMethod employeeId="employee-123" onEvent={onEvent} />)

      await waitFor(
        () => {
          expect(screen.getByText('Chase')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      await user.click(screen.getByRole('button', { name: 'Bank account actions' }))
      await user.click(screen.getByRole('menuitem', { name: 'Delete' }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })

      expect(onEvent).not.toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_BANK_ACCOUNT_DELETED,
        expect.anything(),
      )
    })
  })
})
