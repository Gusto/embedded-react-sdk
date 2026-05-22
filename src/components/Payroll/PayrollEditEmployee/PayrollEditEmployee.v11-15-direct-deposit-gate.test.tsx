import { Suspense } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { MockInstance } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import type { ComponentProps } from 'react'
import * as PresentationModule from './PayrollEditEmployeePresentation'
import { PayrollEditEmployee } from './PayrollEditEmployee'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { getEmptyEmployeeBankAccounts } from '@/test/mocks/apis/employeesBankAccounts'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

/**
 * GEP v2025-11-15 added a new payroll update validation: setting an
 * employee's payment method to "Direct Deposit" returns 422 if the
 * employee has no bank account on file
 * (https://docs.gusto.com/embedded-payroll/changelog).
 *
 * The SDK avoids that 422 entirely by gating the Direct Deposit option
 * in the UI: PayrollEditEmployee.tsx reads
 * `useEmployeePaymentMethodsGetBankAccountsSuspense` and passes
 * `hasDirectDepositSetup = bankAccounts.length > 0` to
 * PayrollEditEmployeePresentation. The presentation then wraps the
 * Direct Deposit / Check radio group in `{hasDirectDepositSetup && (...)}`.
 *
 * PayrollEditEmployeePresentation.test.tsx already pins the gate at the
 * presentation boundary (when `hasDirectDepositSetup` is passed in
 * directly). This spec pins the *wiring* — that the container actually
 * derives `hasDirectDepositSetup` from the bank-accounts response and
 * propagates it correctly. A regression that always passes `true` (or
 * drops the prop) would silently re-expose the path that now 422s on
 * the backend.
 *
 * We intercept the presentation component itself rather than asserting
 * on rendered DOM. The full container has multiple async loading
 * transitions (Suspense bank-accounts → prepare mutation → pay-schedule
 * query) and the form briefly mounts and unmounts during them, which
 * makes DOM-level assertions on the gated radio group flaky. The wire
 * we care about is a single boolean prop, so capturing it directly is
 * both more focused and more stable.
 */
type PresentationProps = ComponentProps<typeof PresentationModule.PayrollEditEmployeePresentation>
type PresentationSpy = MockInstance<(props: PresentationProps) => React.ReactNode>

function renderContainer(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(<GustoTestProvider queryClient={queryClient}>{ui}</GustoTestProvider>)
}

describe('PayrollEditEmployee — v11-15 Direct Deposit no-bank-account gate', () => {
  let presentationSpy: PresentationSpy

  beforeEach(() => {
    setupApiTestMocks()
    presentationSpy = vi
      .spyOn(PresentationModule, 'PayrollEditEmployeePresentation')
      .mockImplementation(() => <></>) as PresentationSpy
  })

  function latestHasDirectDepositSetup(): boolean | undefined {
    expect(presentationSpy).toHaveBeenCalled()
    const lastCall = presentationSpy.mock.calls.at(-1)
    return lastCall?.[0]?.hasDirectDepositSetup
  }

  it('passes hasDirectDepositSetup=false to the presentation when the employee has no bank account on file', async () => {
    server.use(getEmptyEmployeeBankAccounts)

    renderContainer(
      <Suspense fallback={null}>
        <PayrollEditEmployee
          employeeId="employee-without-bank-account"
          companyId="company-123"
          payrollId="payroll-123"
          onEvent={vi.fn()}
        />
      </Suspense>,
    )

    await waitFor(() => {
      expect(latestHasDirectDepositSetup()).toBe(false)
    })
  })

  it('passes hasDirectDepositSetup=true to the presentation when the employee has a bank account on file', async () => {
    renderContainer(
      <Suspense fallback={null}>
        <PayrollEditEmployee
          employeeId="employee-with-bank-account"
          companyId="company-123"
          payrollId="payroll-123"
          onEvent={vi.fn()}
        />
      </Suspense>,
    )

    await waitFor(() => {
      expect(latestHasDirectDepositSetup()).toBe(true)
    })
  })
})
