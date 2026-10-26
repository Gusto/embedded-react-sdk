import type { ReactNode } from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import {
  COMPANY_ID,
  PAYROLL_ID,
  buildPreparedTransitionPayroll,
  buildTransitionPayroll,
} from '../../__fixtures__/transitionConfigurationMocks'
import {
  useTransitionConfigurationForm,
  type UseTransitionConfigurationFormResult,
} from './useTransitionConfigurationForm'
import { PREPARE_QUERY_KEY } from '@/components/Payroll/PayrollConfiguration/usePayrollConfigurationData'
import { createSdkQueryClient } from '@/contexts/ApiProvider/createSdkQueryClient'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import {
  handleGetPayroll,
  handlePayrollsPrepare,
  handlePayrollsUpdate,
} from '@/test/mocks/apis/payrolls'
import { handleCreateOffCyclePayroll } from '@/test/mocks/apis/terminations'
import { server } from '@/test/mocks/server'

type ReadyResult = Extract<UseTransitionConfigurationFormResult, { isLoading: false }>

function assertReady(result: UseTransitionConfigurationFormResult): asserts result is ReadyResult {
  if (result.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

function renderTransitionConfigurationForm() {
  const queryClient = createSdkQueryClient()
  const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')
  const wrapper = ({ children }: { children: ReactNode }) => (
    <GustoTestProvider queryClient={queryClient}>{children}</GustoTestProvider>
  )
  const rendered = renderHook(
    () => useTransitionConfigurationForm({ companyId: COMPANY_ID, payrollId: PAYROLL_ID }),
    { wrapper },
  )
  return { ...rendered, invalidateQueriesSpy }
}

async function waitForReady(result: { current: UseTransitionConfigurationFormResult }) {
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false)
  })
  assertReady(result.current)
  return result.current
}

describe('useTransitionConfigurationForm', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('defaults unset settings to included deductions, the regular rate, and the pay schedule frequency', async () => {
    server.use(handleGetPayroll(() => HttpResponse.json(buildTransitionPayroll())))

    const { result } = renderTransitionConfigurationForm()
    const ready = await waitForReady(result)

    expect(ready.data.taxWithholding).toEqual({
      withholdingPayPeriod: 'Every week',
      fixedWithholdingRate: false,
    })
    expect(ready.form.getFormSubmissionValues()).toEqual({
      skipRegularDeductions: false,
      withholdingPayPeriod: 'Every week',
      fixedWithholdingRate: false,
    })
    expect(ready.data.paySchedule).toMatchObject({ customName: 'Weekly Schedule' })
    expect(ready.data.checkDate).toBe('2025-08-29')
  })

  it('prepares without employees, then saves the settings with one prepared compensation', async () => {
    server.use(
      handleGetPayroll(() =>
        HttpResponse.json(
          buildTransitionPayroll({
            withholding_pay_period: 'Monthly',
            skip_regular_deductions: true,
            fixed_withholding_rate: false,
          }),
        ),
      ),
    )

    let prepareBody: unknown = null
    const prepareResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      prepareBody = await request.json()
      return HttpResponse.json(buildPreparedTransitionPayroll())
    })
    let updateBody: Record<string, unknown> | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json(
        buildPreparedTransitionPayroll({
          check_date: '2025-09-02',
          withholding_pay_period: 'Twice per month',
          skip_regular_deductions: true,
          fixed_withholding_rate: true,
        }),
      )
    })
    const createResolver = vi.fn<HttpResponseResolver>(() => HttpResponse.json({}))
    server.use(
      handlePayrollsPrepare(prepareResolver),
      handlePayrollsUpdate(updateResolver),
      handleCreateOffCyclePayroll(createResolver),
    )

    const { result, invalidateQueriesSpy } = renderTransitionConfigurationForm()
    const ready = await waitForReady(result)

    expect(ready.form.getFormSubmissionValues()).toEqual({
      skipRegularDeductions: true,
      withholdingPayPeriod: 'Monthly',
      fixedWithholdingRate: false,
    })

    act(() => {
      ready.actions.setTaxWithholding({
        withholdingPayPeriod: 'Twice per month',
        fixedWithholdingRate: true,
      })
    })
    await waitFor(() => {
      assertReady(result.current)
      expect(result.current.data.taxWithholding).toEqual({
        withholdingPayPeriod: 'Twice per month',
        fixedWithholdingRate: true,
      })
    })

    assertReady(result.current)
    const readyToSubmit = result.current
    let submitResult: Awaited<ReturnType<typeof readyToSubmit.actions.onSubmit>>
    await act(async () => {
      submitResult = await readyToSubmit.actions.onSubmit()
    })

    expect(prepareResolver).toHaveBeenCalledTimes(1)
    expect(prepareBody).toEqual({})
    expect(updateResolver).toHaveBeenCalledTimes(1)
    expect(updateBody).toMatchObject({
      employee_compensations: [{ employee_uuid: 'employee-1', version: 'compensation-version-1' }],
      skip_regular_deductions: true,
      withholding_pay_period: 'Twice per month',
      fixed_withholding_rate: true,
    })
    expect(prepareResolver.mock.invocationCallOrder[0]!).toBeLessThan(
      updateResolver.mock.invocationCallOrder[0]!,
    )
    expect(createResolver).not.toHaveBeenCalled()
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: [PREPARE_QUERY_KEY, PAYROLL_ID] })

    expect(submitResult!).toMatchObject({
      mode: 'update',
      data: { payrollUuid: PAYROLL_ID, checkDate: '2025-09-02' },
    })
    await waitFor(() => {
      assertReady(result.current)
      expect(result.current.data.checkDate).toBe('2025-09-02')
    })
  })

  it('surfaces a 422 from the update through errorHandling', async () => {
    server.use(
      handleGetPayroll(() => HttpResponse.json(buildTransitionPayroll())),
      handlePayrollsPrepare(() => HttpResponse.json(buildPreparedTransitionPayroll())),
      handlePayrollsUpdate(() =>
        HttpResponse.json(
          {
            errors: [
              {
                error_key: 'base',
                category: 'invalid_operation',
                message: 'Payroll cannot be updated',
              },
            ],
          },
          { status: 422 },
        ),
      ),
    )

    const { result } = renderTransitionConfigurationForm()
    const ready = await waitForReady(result)

    let submitResult: unknown
    await act(async () => {
      submitResult = await ready.actions.onSubmit()
    })

    expect(submitResult).toBeUndefined()
    await waitFor(() => {
      expect(result.current.errorHandling.errors).toHaveLength(1)
    })
    expect(result.current.errorHandling.errors[0]).toMatchObject({
      category: 'api_error',
      httpStatus: 422,
    })
  })

  it('reports an error instead of sending an empty compensation list when prepare returns no employees', async () => {
    const updateResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json(buildPreparedTransitionPayroll()),
    )
    server.use(
      handleGetPayroll(() => HttpResponse.json(buildTransitionPayroll())),
      handlePayrollsPrepare(() =>
        HttpResponse.json(buildPreparedTransitionPayroll({ employee_compensations: [] })),
      ),
      handlePayrollsUpdate(updateResolver),
    )

    const { result } = renderTransitionConfigurationForm()
    const ready = await waitForReady(result)

    let submitResult: unknown
    await act(async () => {
      submitResult = await ready.actions.onSubmit()
    })

    expect(submitResult).toBeUndefined()
    expect(updateResolver).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(result.current.errorHandling.errors).toHaveLength(1)
    })
    expect(result.current.errorHandling.errors[0]).toMatchObject({
      category: 'internal_error',
      message: expect.stringMatching(/no employees/i),
    })
  })
})
