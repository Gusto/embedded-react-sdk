import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { BankFormBody, type BankFormBodyDictionary } from './BankFormBody'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { API_BASE_URL } from '@/test/constants'

describe('BankFormBody', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('renders the bank account fields and default action copy', async () => {
    renderWithProviders(
      <BankFormBody employeeId="employee-123" onSaved={vi.fn()} onCancel={vi.fn()} />,
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Account nickname')).toBeInTheDocument()
    })
    expect(screen.getByLabelText('Routing number')).toBeInTheDocument()
    expect(screen.getByLabelText('Account number')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('calls onSaved with the created bank account on successful submit', async () => {
    const user = userEvent.setup()
    const onSaved = vi.fn()
    server.use(
      http.post(`${API_BASE_URL}/v1/employees/:employee_id/bank_accounts`, async ({ request }) => {
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
      }),
    )

    renderWithProviders(
      <BankFormBody employeeId="employee-123" onSaved={onSaved} onCancel={vi.fn()} />,
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Account nickname')).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText('Account nickname'), 'Test Account')
    await user.type(screen.getByLabelText('Routing number'), '011401533')
    await user.type(screen.getByLabelText('Account number'), '123456789')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ uuid: 'new-account-uuid' }))
    })
  })

  it('calls onCancel when the cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    renderWithProviders(
      <BankFormBody employeeId="employee-123" onSaved={vi.fn()} onCancel={onCancel} />,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('shows required-field validation messages on empty submit', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <BankFormBody employeeId="employee-123" onSaved={vi.fn()} onCancel={vi.fn()} />,
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Account nickname')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByText('Account name is required')).toBeInTheDocument()
    })
    expect(screen.getByText('Routing number should be a number (9 digits)')).toBeInTheDocument()
    expect(screen.getByText('Account number is a required field')).toBeInTheDocument()
  })

  it('renders strings from the dictionary prop in place of the defaults', async () => {
    const dictionary: BankFormBodyDictionary = {
      en: {
        nameLabel: 'Bank nickname',
        saveCta: 'Add account',
        cancelCta: 'Go back',
      },
    }

    renderWithProviders(
      <BankFormBody
        employeeId="employee-123"
        dictionary={dictionary}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Bank nickname')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Add account' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument()
  })
})
