import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import {
  useChildSupportGarnishmentForm,
  type UseChildSupportGarnishmentFormResult,
} from './useChildSupportGarnishmentForm'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { API_BASE_URL } from '@/test/constants'

type ReadyResult = Extract<UseChildSupportGarnishmentFormResult, { isLoading: false }>

function assertReady(
  hookResult: UseChildSupportGarnishmentFormResult,
): asserts hookResult is ReadyResult {
  if (hookResult.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

/**
 * Waits until the hook reaches the ready state, then returns it narrowed.
 * Caller is responsible for noticing that `result.current` may move past
 * the captured snapshot on subsequent renders; for that, re-read
 * `result.current` and call `assertReady` again, or pass `result` into
 * `act(...)` directly.
 */
async function waitForReady(
  getResult: () => UseChildSupportGarnishmentFormResult,
): Promise<ReadyResult> {
  await waitFor(() => {
    assertReady(getResult())
  })
  const current = getResult()
  assertReady(current)
  return current
}

// Agency fixtures (snake_case; the SDK transforms inbound to camelCase).
type AgencyFixture = {
  state: string
  name: string
  manual_payment_required: boolean
  fips_codes: Array<{ county: string | null; code: string }>
  required_attributes: Array<{ key: string; label: string }>
}

const AGENCY_AK: AgencyFixture = {
  state: 'AK',
  name: 'Alaska Child Support Services Division',
  manual_payment_required: false,
  fips_codes: [{ county: null, code: '02-AK' }],
  required_attributes: [{ key: 'case_number', label: 'CSE Case Number' }],
}

const AGENCY_OH: AgencyFixture = {
  state: 'OH',
  name: 'Ohio CSEA',
  manual_payment_required: true,
  fips_codes: [
    { county: 'Franklin', code: '39-049' },
    { county: 'Cuyahoga', code: '39-035' },
  ],
  required_attributes: [
    { key: 'case_number', label: 'Case Number' },
    { key: 'order_number', label: 'Order Number' },
  ],
}

const stubAgencyData = (agencies: AgencyFixture[]) => {
  server.use(
    http.get(`${API_BASE_URL}/v1/garnishments/child_support`, () =>
      HttpResponse.json({ agencies }),
    ),
  )
}

describe('useChildSupportGarnishmentForm', () => {
  beforeEach(() => {
    setupApiTestMocks()
    stubAgencyData([AGENCY_AK, AGENCY_OH])
  })

  describe('agency-keyed conditional fields', () => {
    it('starts loading and resolves with agency entries on data', async () => {
      const { result } = renderHook(
        () => useChildSupportGarnishmentForm({ employeeId: 'employee-123' }),
        { wrapper: GustoTestProvider },
      )

      expect(result.current.isLoading).toBe(true)
      const ready = await waitForReady(() => result.current)

      expect(ready.data.agencies).toEqual([
        expect.objectContaining({ state: 'AK', name: 'Alaska Child Support Services Division' }),
        expect.objectContaining({
          state: 'OH',
          name: 'Ohio CSEA',
          manualPaymentRequired: true,
        }),
      ])
      // No agency selected initially → no attribute fields, no county select.
      expect(ready.form.Fields.CaseNumber).toBeUndefined()
      expect(ready.form.Fields.OrderNumber).toBeUndefined()
      expect(ready.form.Fields.RemittanceNumber).toBeUndefined()
      expect(ready.form.Fields.FipsCode).toBeUndefined()
      expect(ready.status.selectedAgency).toBeNull()
      expect(ready.status.isManualPaymentRequired).toBe(false)
    })

    it('selecting AK (single all-counties fips) exposes CaseNumber, auto-fills fipsCode, and keeps FipsCode hidden', async () => {
      const { result } = renderHook(
        () => useChildSupportGarnishmentForm({ employeeId: 'employee-123' }),
        { wrapper: GustoTestProvider },
      )

      const ready = await waitForReady(() => result.current)

      act(() => {
        ready.form.hookFormInternals.formMethods.setValue('state', 'AK')
      })

      await waitFor(() => {
        const r = result.current
        assertReady(r)
        expect(r.status.selectedAgency?.state).toBe('AK')
      })

      const updated = result.current
      assertReady(updated)
      expect(updated.form.Fields.CaseNumber).toBeDefined()
      expect(updated.form.Fields.OrderNumber).toBeUndefined()
      expect(updated.form.Fields.RemittanceNumber).toBeUndefined()
      // Single all-counties fips → no county select needed
      expect(updated.form.Fields.FipsCode).toBeUndefined()
      // …and the field auto-populates so the submit payload carries it.
      expect(updated.form.hookFormInternals.formMethods.getValues('fipsCode')).toBe('02-AK')
    })

    it('selecting OH (multi-county) exposes CaseNumber + OrderNumber + FipsCode and surfaces manual-payment flag', async () => {
      const { result } = renderHook(
        () => useChildSupportGarnishmentForm({ employeeId: 'employee-123' }),
        { wrapper: GustoTestProvider },
      )

      const ready = await waitForReady(() => result.current)

      act(() => {
        ready.form.hookFormInternals.formMethods.setValue('state', 'OH')
      })

      await waitFor(() => {
        const r = result.current
        assertReady(r)
        expect(r.status.selectedAgency?.state).toBe('OH')
      })

      const updated = result.current
      assertReady(updated)
      expect(updated.form.Fields.CaseNumber).toBeDefined()
      expect(updated.form.Fields.OrderNumber).toBeDefined()
      expect(updated.form.Fields.RemittanceNumber).toBeUndefined()
      expect(updated.form.Fields.FipsCode).toBeDefined()
      expect(updated.status.isManualPaymentRequired).toBe(true)
      expect(updated.data.counties).toHaveLength(2)
    })

    it('switching agencies wipes the previous attribute values', async () => {
      const { result } = renderHook(
        () => useChildSupportGarnishmentForm({ employeeId: 'employee-123' }),
        { wrapper: GustoTestProvider },
      )

      const ready = await waitForReady(() => result.current)
      const fm = ready.form.hookFormInternals.formMethods

      // Pick OH, fill case+order numbers.
      act(() => {
        fm.setValue('state', 'OH')
      })
      await waitFor(() => {
        const r = result.current
        assertReady(r)
        expect(r.status.selectedAgency?.state).toBe('OH')
      })
      act(() => {
        fm.setValue('caseNumber', 'OH-CASE')
        fm.setValue('orderNumber', 'OH-ORDER')
      })

      // Switch to AK — the agency-attribute fields should clear.
      act(() => {
        fm.setValue('state', 'AK')
      })

      await waitFor(() => {
        const r = result.current
        assertReady(r)
        expect(r.status.selectedAgency?.state).toBe('AK')
      })

      expect(fm.getValues('caseNumber')).toBe('')
      expect(fm.getValues('orderNumber')).toBe('')
      expect(fm.getValues('remittanceNumber')).toBe('')
    })
  })

  describe('create submit', () => {
    it('POSTs a child-support garnishment with the canonical body shape', async () => {
      let createBody: Record<string, unknown> | null = null
      const createResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        createBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          {
            uuid: 'cs-1',
            version: 'v1',
            active: true,
            amount: '40',
            description: 'Child Support - AK-CASE-1',
            recurring: true,
            deduct_as_percentage: true,
            court_ordered: true,
            garnishment_type: 'child_support',
            times: null,
            annual_maximum: null,
            pay_period_maximum: '500',
            total_amount: null,
            child_support: {
              state: 'AK',
              fips_code: '02-AK',
              case_number: 'AK-CASE-1',
              order_number: null,
              remittance_number: null,
              payment_period: 'Monthly',
            },
          },
          { status: 201 },
        )
      })
      server.use(
        http.post(`${API_BASE_URL}/v1/employees/:employee_id/garnishments`, createResolver),
      )

      const { result } = renderHook(
        () => useChildSupportGarnishmentForm({ employeeId: 'employee-123' }),
        { wrapper: GustoTestProvider },
      )

      const ready = await waitForReady(() => result.current)
      const fm = ready.form.hookFormInternals.formMethods

      // Pick AK first so the wipe-on-state-change effect runs before we
      // populate the agency-attribute field.
      act(() => {
        fm.setValue('state', 'AK')
      })
      await waitFor(() => {
        const r = result.current
        assertReady(r)
        expect(r.status.selectedAgency?.state).toBe('AK')
      })

      act(() => {
        fm.setValue('caseNumber', 'AK-CASE-1')
        fm.setValue('payPeriodMaximum', 500)
        fm.setValue('amount', 40)
        fm.setValue('paymentPeriod', 'Monthly')
      })

      let submitResult
      await act(async () => {
        const r = result.current
        assertReady(r)
        submitResult = await r.actions.onSubmit()
      })

      expect(createResolver).toHaveBeenCalledTimes(1)
      expect(createBody).toMatchObject({
        active: true,
        amount: '40',
        description: 'Child Support - AK-CASE-1',
        court_ordered: true,
        garnishment_type: 'child_support',
        recurring: true,
        deduct_as_percentage: true,
        times: null,
        pay_period_maximum: '500',
        child_support: {
          state: 'AK',
          fips_code: '02-AK',
          case_number: 'AK-CASE-1',
          payment_period: 'Monthly',
        },
      })
      expect(submitResult).toMatchObject({
        mode: 'create',
        data: { uuid: 'cs-1', garnishmentType: 'child_support' },
      })
    })
  })
})
