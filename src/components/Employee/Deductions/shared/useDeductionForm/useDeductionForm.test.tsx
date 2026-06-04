import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { useDeductionForm, type UseDeductionFormResult } from './useDeductionForm'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { API_BASE_URL } from '@/test/constants'

type ReadyResult = Extract<UseDeductionFormResult, { isLoading: false }>

function assertReady(hookResult: UseDeductionFormResult): asserts hookResult is ReadyResult {
  if (hookResult.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

// Garnishments come back as snake_case from the API; the SDK transforms them
// to camelCase. MSW responses therefore use snake_case keys.
type GarnishmentApiFixture = {
  uuid: string
  version: string
  active: boolean
  amount: string
  description: string
  recurring: boolean
  deduct_as_percentage: boolean
  court_ordered: boolean
  times: number | null
  annual_maximum: string | null
  pay_period_maximum: string | null
  total_amount: string | null
  garnishment_type?: string
}

const buildDeductionFixture = (
  overrides: Partial<GarnishmentApiFixture> & { uuid: string },
): GarnishmentApiFixture => ({
  active: true,
  amount: '50',
  description: 'Loaded Deduction',
  recurring: true,
  deduct_as_percentage: false,
  court_ordered: false,
  times: null,
  annual_maximum: null,
  pay_period_maximum: null,
  total_amount: null,
  version: `version-${overrides.uuid}`,
  ...overrides,
})

const stubList = (garnishments: GarnishmentApiFixture[]) => {
  server.use(
    http.get(`${API_BASE_URL}/v1/employees/:employee_id/garnishments`, () =>
      HttpResponse.json(garnishments),
    ),
  )
}

describe('useDeductionForm', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  describe('create mode', () => {
    it('starts ready immediately (no list fetch) with create mode status', () => {
      const { result } = renderHook(
        () => useDeductionForm({ employeeId: 'employee-123', courtOrdered: false }),
        { wrapper: GustoTestProvider },
      )

      assertReady(result.current)
      expect(result.current.status.mode).toBe('create')
      expect(result.current.status.isPending).toBe(false)
      expect(result.current.data.deduction).toBe(null)
    })

    it('exposes GarnishmentType only when courtOrdered is true', () => {
      const customHook = renderHook(
        () => useDeductionForm({ employeeId: 'employee-123', courtOrdered: false }),
        { wrapper: GustoTestProvider },
      )
      assertReady(customHook.result.current)
      expect(customHook.result.current.form.Fields.GarnishmentType).toBeUndefined()

      const courtOrderedHook = renderHook(
        () => useDeductionForm({ employeeId: 'employee-123', courtOrdered: true }),
        { wrapper: GustoTestProvider },
      )
      assertReady(courtOrderedHook.result.current)
      expect(courtOrderedHook.result.current.form.Fields.GarnishmentType).toBeDefined()
    })

    it('hides TotalAmount / AnnualMaximum when recurring becomes false', async () => {
      const { result } = renderHook(
        () =>
          useDeductionForm({
            employeeId: 'employee-123',
            courtOrdered: false,
            defaultValues: { recurring: true },
          }),
        { wrapper: GustoTestProvider },
      )

      assertReady(result.current)
      expect(result.current.status.isRecurring).toBe(true)
      expect(result.current.form.Fields.TotalAmount).toBeDefined()
      expect(result.current.form.Fields.AnnualMaximum).toBeDefined()

      act(() => {
        assertReady(result.current)
        result.current.form.hookFormInternals.formMethods.setValue('recurring', false)
      })

      await waitFor(() => {
        assertReady(result.current)
        expect(result.current.status.isRecurring).toBe(false)
      })

      // The waitFor closure asserted ready; the narrowing carries here.
      expect(result.current.form.Fields.TotalAmount).toBeUndefined()
      expect(result.current.form.Fields.AnnualMaximum).toBeUndefined()
    })

    // The frequency RadioGroup writes the string `'false'` into form state
    // (not a boolean) — and `'false'` is truthy. Without coercion the cap
    // fields would stay visible for one-time deductions (SDK-944). This guards
    // the string shape specifically; the boolean case is covered above.
    it('hides the cap fields when recurring is set to the string "false" (RadioGroup shape)', async () => {
      const { result } = renderHook(
        () =>
          useDeductionForm({
            employeeId: 'employee-123',
            courtOrdered: false,
            defaultValues: { recurring: true },
          }),
        { wrapper: GustoTestProvider },
      )

      assertReady(result.current)
      expect(result.current.form.Fields.TotalAmount).toBeDefined()

      act(() => {
        assertReady(result.current)
        result.current.form.hookFormInternals.formMethods.setValue(
          'recurring',
          'false' as unknown as boolean,
        )
      })

      await waitFor(() => {
        assertReady(result.current)
        expect(result.current.status.isRecurring).toBe(false)
      })

      expect(result.current.form.Fields.TotalAmount).toBeUndefined()
      expect(result.current.form.Fields.AnnualMaximum).toBeUndefined()
    })

    it('POSTs a custom deduction with courtOrdered:false and no garnishment_type', async () => {
      let createBody: Record<string, unknown> | null = null
      const createResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        createBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          buildDeductionFixture({
            uuid: 'created-custom',
            description: 'Parking',
            amount: '25',
            recurring: false,
            deduct_as_percentage: false,
            court_ordered: false,
            times: 1,
          }),
          { status: 201 },
        )
      })
      server.use(
        http.post(`${API_BASE_URL}/v1/employees/:employee_id/garnishments`, createResolver),
      )

      const { result } = renderHook(
        () =>
          useDeductionForm({
            employeeId: 'employee-123',
            courtOrdered: false,
            defaultValues: {
              description: 'Parking',
              recurring: false,
              deductAsPercentage: false,
              amount: 25,
              totalAmount: 0,
              annualMaximum: 0,
            },
          }),
        { wrapper: GustoTestProvider },
      )

      let submitResult
      await act(async () => {
        assertReady(result.current)
        submitResult = await result.current.actions.onSubmit()
      })

      expect(createResolver).toHaveBeenCalledTimes(1)
      expect(createBody).toMatchObject({
        description: 'Parking',
        recurring: false,
        deduct_as_percentage: false,
        amount: '25',
        court_ordered: false,
        times: 1,
      })
      expect(createBody).not.toHaveProperty('garnishment_type')
      // Zero caps don't carry a positive value on the wire — the API treats
      // null or an omitted field as "no cap". The SDK's outbound schema has
      // `annual_maximum: z.nullable(z.string()).default(null)`, so it
      // explicitly emits null when we pass undefined; `total_amount` is
      // `.optional()` and gets omitted entirely. Both are acceptable wire
      // shapes — assert the absence of a positive string.
      const body = createBody as Record<string, unknown> | null
      expect(body?.total_amount ?? null).toBeNull()
      expect(body?.annual_maximum ?? null).toBeNull()
      expect(submitResult).toMatchObject({
        mode: 'create',
        data: { uuid: 'created-custom', courtOrdered: false },
      })
    })

    it('POSTs a court-ordered garnishment with the selected garnishment_type and caps', async () => {
      let createBody: Record<string, unknown> | null = null
      const createResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        createBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          buildDeductionFixture({
            uuid: 'created-court',
            description: 'Federal Tax Lien',
            amount: '15',
            recurring: true,
            deduct_as_percentage: true,
            court_ordered: true,
            times: null,
            garnishment_type: 'federal_tax_lien',
            total_amount: '2000',
            annual_maximum: '1000',
          }),
          { status: 201 },
        )
      })
      server.use(
        http.post(`${API_BASE_URL}/v1/employees/:employee_id/garnishments`, createResolver),
      )

      const { result } = renderHook(
        () =>
          useDeductionForm({
            employeeId: 'employee-123',
            courtOrdered: true,
            defaultValues: {
              description: 'Federal Tax Lien',
              recurring: true,
              deductAsPercentage: true,
              amount: 15,
              totalAmount: 2000,
              annualMaximum: 1000,
              garnishmentType: 'federal_tax_lien',
            },
          }),
        { wrapper: GustoTestProvider },
      )

      let submitResult
      await act(async () => {
        assertReady(result.current)
        submitResult = await result.current.actions.onSubmit()
      })

      expect(createResolver).toHaveBeenCalledTimes(1)
      expect(createBody).toMatchObject({
        description: 'Federal Tax Lien',
        recurring: true,
        deduct_as_percentage: true,
        amount: '15',
        court_ordered: true,
        garnishment_type: 'federal_tax_lien',
        total_amount: '2000',
        annual_maximum: '1000',
        times: null,
      })
      expect(submitResult).toMatchObject({
        mode: 'create',
        data: { uuid: 'created-court' },
      })
    })

    it('surfaces a create failure through errorHandling.errors', async () => {
      server.use(
        http.post(`${API_BASE_URL}/v1/employees/:employee_id/garnishments`, () =>
          HttpResponse.json(
            { error_key: 'server_error', errors: [{ message: 'Boom' }] },
            { status: 500 },
          ),
        ),
      )

      const { result } = renderHook(
        () =>
          useDeductionForm({
            employeeId: 'employee-123',
            courtOrdered: false,
            defaultValues: {
              description: 'Test',
              recurring: true,
              deductAsPercentage: false,
              amount: 10,
              totalAmount: 0,
              annualMaximum: 0,
            },
          }),
        { wrapper: GustoTestProvider },
      )

      await act(async () => {
        assertReady(result.current)
        await result.current.actions.onSubmit()
      })

      await waitFor(() => {
        expect(result.current.errorHandling.errors.length).toBeGreaterThan(0)
      })
    })
  })

  describe('update mode', () => {
    it('loads the matching deduction from the list and PUTs to /v1/garnishments/:id', async () => {
      const existing = buildDeductionFixture({
        uuid: 'existing-1',
        description: 'Health Insurance',
        amount: '120',
        court_ordered: false,
      })
      stubList([existing])

      let updatePath: string | null = null
      let updateBody: Record<string, unknown> | null = null
      const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        updatePath = new URL(request.url).pathname
        updateBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ ...existing, description: 'Renamed' })
      })
      server.use(http.put(`${API_BASE_URL}/v1/garnishments/:garnishment_id`, updateResolver))

      const { result } = renderHook(
        () =>
          useDeductionForm({
            employeeId: 'employee-123',
            garnishmentId: 'existing-1',
            courtOrdered: false,
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      expect(result.current.status.mode).toBe('update')
      expect(result.current.data.deduction?.uuid).toBe('existing-1')

      // Mutate one field, then submit
      act(() => {
        assertReady(result.current)
        result.current.form.hookFormInternals.formMethods.setValue('description', 'Renamed')
      })

      let submitResult
      await act(async () => {
        assertReady(result.current)
        submitResult = await result.current.actions.onSubmit()
      })

      expect(updateResolver).toHaveBeenCalledTimes(1)
      expect(updatePath).toBe('/v1/garnishments/existing-1')
      expect(updateBody).toMatchObject({
        description: 'Renamed',
        version: 'version-existing-1',
        court_ordered: false,
      })
      expect(submitResult).toMatchObject({
        mode: 'update',
        data: { uuid: 'existing-1', description: 'Renamed' },
      })
    })

    it('hides the cap fields on load when editing a one-time deduction, and matches create-mode visibility', async () => {
      const oneTime = buildDeductionFixture({
        uuid: 'one-time-1',
        description: 'Parking',
        recurring: false,
        court_ordered: false,
      })
      stubList([oneTime])

      const { result } = renderHook(
        () =>
          useDeductionForm({
            employeeId: 'employee-123',
            garnishmentId: 'one-time-1',
            courtOrdered: false,
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      expect(result.current.status.isRecurring).toBe(false)
      // Consistent with creating a one-time deduction: caps are not shown.
      expect(result.current.form.Fields.TotalAmount).toBeUndefined()
      expect(result.current.form.Fields.AnnualMaximum).toBeUndefined()
    })
  })
})
