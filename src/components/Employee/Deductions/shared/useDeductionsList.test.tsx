import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import type { Garnishment } from '@gusto/embedded-api-v-2026-02-01/models/components/garnishment'
import { useDeductionsList, type UseDeductionsListResult } from './useDeductionsList'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { API_BASE_URL } from '@/test/constants'

type ReadyResult = Extract<UseDeductionsListResult, { isLoading: false }>

function assertReady(hookResult: UseDeductionsListResult): asserts hookResult is ReadyResult {
  if (hookResult.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

// Garnishments come back as snake_case from the API; the SDK transforms them to
// camelCase on the way in. MSW responses therefore use snake_case keys.
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
}

const buildDeductionFixture = (
  overrides: Partial<GarnishmentApiFixture> & { uuid: string },
): GarnishmentApiFixture => ({
  active: true,
  amount: '50',
  description: 'Test Deduction',
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

const findDeduction = (
  deductions: readonly Garnishment[] | undefined,
  uuid: string,
): Garnishment => {
  const match = deductions?.find(d => d.uuid === uuid)
  if (!match) throw new Error(`expected deduction with uuid ${uuid} but did not find one`)
  return match
}

describe('useDeductionsList', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  const stubList = (garnishments: GarnishmentApiFixture[]) => {
    server.use(
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/garnishments`, () =>
        HttpResponse.json(garnishments),
      ),
    )
  }

  it('starts loading then resolves to a ready state filtered to active deductions', async () => {
    stubList([
      buildDeductionFixture({ uuid: 'active-1', description: 'Active One' }),
      buildDeductionFixture({ uuid: 'inactive-1', description: 'Inactive One', active: false }),
    ])

    const { result } = renderHook(() => useDeductionsList({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.errorHandling.errors).toEqual([])

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    expect(result.current.data.deductions).toHaveLength(1)
    expect(result.current.data.deductions[0]?.uuid).toBe('active-1')
    expect(result.current.status.isPending).toBe(false)
    expect(result.current.status.isFetching).toBe(false)
    expect(result.current.status.deletingGarnishmentUuid).toBeUndefined()
    expect(result.current.actions.onDelete).toBeDefined()
  })

  it('actions.onDelete PUTs /v1/garnishments/:id with active:false and returns remainingActiveCount > 0 when others remain', async () => {
    const a = buildDeductionFixture({ uuid: 'garn-1', description: 'Health Insurance' })
    const b = buildDeductionFixture({ uuid: 'garn-2', description: 'Parking Fee' })
    stubList([a, b])

    let updatePath: string | null = null
    let updateBody: Record<string, unknown> | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updatePath = new URL(request.url).pathname
      updateBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({ ...a, active: false })
    })
    server.use(http.put(`${API_BASE_URL}/v1/garnishments/:garnishment_id`, updateResolver))

    const { result } = renderHook(() => useDeductionsList({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    // Hook needs to be fully loaded so we can target the same Garnishment object
    // it received from the SDK (camelCase, transformed). Calling onDelete with
    // the raw snake_case fixture would not match the in-memory list.
    let ready: ReadyResult
    await waitFor(() => {
      assertReady(result.current)
      ready = result.current
    })
    const target = findDeduction(ready!.data.deductions, 'garn-1')

    let submitResult
    await act(async () => {
      submitResult = await ready!.actions.onDelete(target)
    })

    expect(updateResolver).toHaveBeenCalledTimes(1)
    expect(updatePath).toBe('/v1/garnishments/garn-1')
    expect(updateBody).toMatchObject({ active: false, version: 'version-garn-1' })
    expect(submitResult).toMatchObject({
      mode: 'update',
      data: { remainingActiveCount: 1, garnishment: { uuid: 'garn-1', active: false } },
    })
  })

  it('actions.onDelete returns remainingActiveCount === 0 when soft-deleting the last active row', async () => {
    const only = buildDeductionFixture({ uuid: 'sole', description: 'Sole Deduction' })
    stubList([only])
    server.use(
      http.put(`${API_BASE_URL}/v1/garnishments/:garnishment_id`, () =>
        HttpResponse.json({ ...only, active: false }),
      ),
    )

    const { result } = renderHook(() => useDeductionsList({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    let ready: ReadyResult
    await waitFor(() => {
      assertReady(result.current)
      ready = result.current
    })
    const target = findDeduction(ready!.data.deductions, 'sole')

    let submitResult
    await act(async () => {
      submitResult = await ready!.actions.onDelete(target)
    })

    expect(submitResult).toMatchObject({
      mode: 'update',
      data: { remainingActiveCount: 0 },
    })
  })

  it('actions.onDelete ignores already-inactive rows in the remaining count', async () => {
    const a = buildDeductionFixture({ uuid: 'garn-a', description: 'A' })
    const b = buildDeductionFixture({ uuid: 'garn-b', description: 'B' })
    const inactive = buildDeductionFixture({
      uuid: 'garn-inactive',
      description: 'Inactive',
      active: false,
    })
    stubList([a, b, inactive])
    server.use(
      http.put(`${API_BASE_URL}/v1/garnishments/:garnishment_id`, () =>
        HttpResponse.json({ ...a, active: false }),
      ),
    )

    const { result } = renderHook(() => useDeductionsList({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    let ready: ReadyResult
    await waitFor(() => {
      assertReady(result.current)
      ready = result.current
    })
    const target = findDeduction(ready!.data.deductions, 'garn-a')

    let submitResult
    await act(async () => {
      submitResult = await ready!.actions.onDelete(target)
    })

    expect(submitResult).toMatchObject({
      mode: 'update',
      data: { remainingActiveCount: 1 },
    })
  })

  it('surfaces a delete failure through errorHandling.errors', async () => {
    const a = buildDeductionFixture({ uuid: 'garn-fail', description: 'Will Fail' })
    stubList([a])
    server.use(
      http.put(`${API_BASE_URL}/v1/garnishments/:garnishment_id`, () =>
        HttpResponse.json(
          { error_key: 'server_error', errors: [{ message: 'Boom' }] },
          { status: 500 },
        ),
      ),
    )

    const { result } = renderHook(() => useDeductionsList({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    let ready: ReadyResult
    await waitFor(() => {
      assertReady(result.current)
      ready = result.current
    })
    const target = findDeduction(ready!.data.deductions, 'garn-fail')

    await act(async () => {
      await ready!.actions.onDelete(target)
    })

    await waitFor(() => {
      expect(result.current.errorHandling.errors.length).toBeGreaterThan(0)
    })
  })
})
