import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { RecoveryCasesResubmit } from './RecoveryCasesResubmit'
import { server } from '@/test/mocks/server'
import { recoveryCasesEvents } from '@/shared/constants'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { handleGetRecoveryCases, handleRedebitRecoveryCase } from '@/test/mocks/apis/recovery_cases'
import { FlowContext } from '@/components/Flow/useFlow'

describe('RecoveryCasesResubmit', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()
  const defaultProps = {
    recoveryCaseId: 'rc-1',
    onEvent,
  }

  const flowContextValue = {
    companyId: 'company-123',
    component: null,
    onEvent,
  }

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(
      handleGetRecoveryCases(() => {
        return HttpResponse.json([
          {
            uuid: 'rc-1',
            company_uuid: 'company-123',
            status: 'open',
            latest_error_code: 'R01',
            original_debit_date: '2024-01-05',
            check_date: '2024-01-09',
            payroll_uuid: 'payroll-1',
            contractor_payment_uuids: null,
            amount_outstanding: '1000.00',
            event_total_amount: '1000.00',
          },
        ])
      }),
    )
  })

  it('renders the error code content for R01', async () => {
    renderWithProviders(
      <FlowContext.Provider value={flowContextValue}>
        <RecoveryCasesResubmit {...defaultProps} />
      </FlowContext.Provider>,
    )

    await screen.findByText('R01: Insufficient funds')
    expect(screen.getByText('Ensure sufficient funds to unblock your account')).toBeInTheDocument()
    expect(screen.getByText(/We attempted to debit from your bank account/)).toBeInTheDocument()
  })

  it('renders the error code content for R16', async () => {
    server.use(
      handleGetRecoveryCases(() => {
        return HttpResponse.json([
          {
            uuid: 'rc-1',
            company_uuid: 'company-123',
            status: 'open',
            latest_error_code: 'R16',
            original_debit_date: '2024-01-05',
            check_date: '2024-01-09',
            payroll_uuid: 'payroll-1',
            contractor_payment_uuids: null,
            amount_outstanding: '1000.00',
            event_total_amount: '1000.00',
          },
        ])
      }),
    )

    renderWithProviders(
      <FlowContext.Provider value={flowContextValue}>
        <RecoveryCasesResubmit {...defaultProps} />
      </FlowContext.Provider>,
    )

    await screen.findByText('R16: Account frozen')
    expect(
      screen.getByText('Unfreeze your bank account to unblock your account'),
    ).toBeInTheDocument()
  })

  it('renders generic bank error for unknown error codes', async () => {
    server.use(
      handleGetRecoveryCases(() => {
        return HttpResponse.json([
          {
            uuid: 'rc-1',
            company_uuid: 'company-123',
            status: 'open',
            latest_error_code: 'UNKNOWN_CODE',
            original_debit_date: null,
            check_date: '2024-01-09',
            payroll_uuid: 'payroll-1',
            contractor_payment_uuids: null,
            amount_outstanding: '1000.00',
            event_total_amount: '1000.00',
          },
        ])
      }),
    )

    renderWithProviders(
      <FlowContext.Provider value={flowContextValue}>
        <RecoveryCasesResubmit {...defaultProps} />
      </FlowContext.Provider>,
    )

    await screen.findByText('Bank error')
    expect(screen.getByText('Contact your bank')).toBeInTheDocument()
  })

  it('fires cancel event when Footer cancel button is clicked', async () => {
    renderWithProviders(
      <FlowContext.Provider value={flowContextValue}>
        <RecoveryCasesResubmit {...defaultProps} />
        <RecoveryCasesResubmit.Footer onEvent={onEvent} />
      </FlowContext.Provider>,
    )

    await screen.findByText('R01: Insufficient funds')

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)

    expect(onEvent).toHaveBeenCalledWith(recoveryCasesEvents.RECOVERY_CASE_RESUBMIT_CANCEL)
  })

  it('submits redebit and fires done event with response data', async () => {
    server.use(
      handleRedebitRecoveryCase(() => {
        return new HttpResponse(null, { status: 202 })
      }),
    )

    renderWithProviders(
      <FlowContext.Provider value={flowContextValue}>
        <RecoveryCasesResubmit {...defaultProps} />
        <RecoveryCasesResubmit.Footer onEvent={onEvent} />
      </FlowContext.Provider>,
    )

    await screen.findByText('R01: Insufficient funds')

    const submitButton = screen.getByRole('button', { name: 'Resubmit payment' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(
        recoveryCasesEvents.RECOVERY_CASE_RESUBMIT_DONE,
        expect.objectContaining({
          recoveryCaseId: 'rc-1',
        }),
      )
    })
  })
})
