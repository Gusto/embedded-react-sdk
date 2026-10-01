import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { useDismissal, type UseDismissalResult } from './useDismissal'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { server } from '@/test/mocks/server'
import {
  handleGetContractor,
  handleScheduleContractorDismissal,
} from '@/test/mocks/apis/contractors'
import { setupApiTestMocks } from '@/test/mocks/apiServer'

type ReadyResult = Extract<UseDismissalResult, { isLoading: false }>

function assertReady(hookResult: UseDismissalResult): asserts hookResult is ReadyResult {
  if (hookResult.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

const baseContractor = {
  uuid: 'contractor-123',
  company_uuid: 'company-123',
  type: 'Individual',
  first_name: 'Ada',
  last_name: 'Lovelace',
  start_date: '2024-03-15',
  wage_type: 'Hourly',
  hourly_rate: '50.00',
  is_active: true,
  version: 'version-123',
  onboarded: true,
  onboarding_status: 'onboarding_completed',
}

describe('useDismissal', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(handleGetContractor(() => HttpResponse.json(baseContractor)))
  })

  it('starts in the loading state and resolves with the contractor', async () => {
    const { result } = renderHook(() => useDismissal({ contractorId: 'contractor-123' }), {
      wrapper: GustoTestProvider,
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.errorHandling.errors).toEqual([])

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    expect(result.current.data.contractor).toMatchObject({
      uuid: 'contractor-123',
      firstName: 'Ada',
      lastName: 'Lovelace',
    })
  })

  it('schedules a dismissal by calling the termination mutation with the chosen end date', async () => {
    let requestBody: Record<string, unknown> | null = null
    const dismissResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      requestBody = (await request.json()) as Record<string, unknown>
      return new HttpResponse(null, { status: 204 })
    })
    server.use(handleScheduleContractorDismissal(dismissResolver))

    const { result } = renderHook(() => useDismissal({ contractorId: 'contractor-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    const { dismiss } = result.current.actions

    let submitResult
    await act(async () => {
      submitResult = await dismiss(new Date(2026, 8, 1))
    })

    expect(dismissResolver).toHaveBeenCalledTimes(1)
    expect(requestBody).toMatchObject({ end_date: '2026-09-01' })
    expect(submitResult).toMatchObject({ mode: 'create' })
  })

  it('surfaces a mutation error via errorHandling', async () => {
    server.use(
      handleScheduleContractorDismissal(
        () =>
          new HttpResponse(JSON.stringify({ message: 'Contractor already dismissed' }), {
            status: 422,
          }),
      ),
    )

    const { result } = renderHook(() => useDismissal({ contractorId: 'contractor-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    const { dismiss } = result.current.actions

    await act(async () => {
      await dismiss(new Date(2026, 8, 1))
    })

    await waitFor(() => {
      assertReady(result.current)
      expect(result.current.errorHandling.errors.length).toBeGreaterThan(0)
    })
  })
})
