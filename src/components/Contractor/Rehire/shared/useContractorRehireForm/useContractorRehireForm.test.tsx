import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import {
  useContractorRehireForm,
  type UseContractorRehireFormResult,
} from './useContractorRehireForm'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { handleGetContractor, handleScheduleContractorRehire } from '@/test/mocks/apis/contractors'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

type ReadyResult = Extract<UseContractorRehireFormResult, { isLoading: false }>

function assertReady(hookResult: UseContractorRehireFormResult): asserts hookResult is ReadyResult {
  if (hookResult.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

const dismissedContractor = {
  uuid: 'contractor-123',
  company_uuid: 'company-123',
  type: 'Individual',
  first_name: 'Ada',
  last_name: 'Lovelace',
  start_date: '2024-03-15',
  dismissal_date: '2025-06-30',
  wage_type: 'Hourly',
  hourly_rate: '50.00',
  is_active: false,
  version: 'version-123',
  onboarded: true,
  onboarding_status: 'onboarding_completed',
}

function renderRehireForm() {
  return renderHook(() => useContractorRehireForm({ contractorId: 'contractor-123' }), {
    wrapper: GustoTestProvider,
  })
}

describe('useContractorRehireForm', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(handleGetContractor(() => HttpResponse.json(dismissedContractor)))
  })

  it('resolves with the contractor and bounds the start date to the day after dismissal', async () => {
    const { result } = renderRehireForm()

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    expect(result.current.data.contractor).toMatchObject({
      uuid: 'contractor-123',
      firstName: 'Ada',
      lastName: 'Lovelace',
    })
    expect(result.current.status.mode).toBe('create')
    expect(result.current.form.fieldsMetadata.startDate).toMatchObject({
      name: 'startDate',
      isRequired: true,
      minDate: '2025-07-01',
    })
    expect(typeof result.current.form.Fields.StartDate).toBe('function')
  })

  it('schedules the rehire with the chosen start date', async () => {
    let requestBody: Record<string, unknown> | null = null
    const rehireResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      requestBody = (await request.json()) as Record<string, unknown>
      return new HttpResponse(null, { status: 204 })
    })
    server.use(handleScheduleContractorRehire(rehireResolver))

    const { result } = renderRehireForm()

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      assertReady(result.current)
      result.current.form.hookFormInternals.formMethods.setValue('startDate', '2026-09-01')
    })

    let submitResult
    await act(async () => {
      assertReady(result.current)
      submitResult = await result.current.actions.onSubmit()
    })

    expect(rehireResolver).toHaveBeenCalledTimes(1)
    expect(requestBody).toMatchObject({ start_date: '2026-09-01' })
    expect(submitResult).toMatchObject({ mode: 'create' })
  })

  it('does not call the API and returns no result when the start date is missing', async () => {
    const rehireResolver = vi.fn<HttpResponseResolver>(
      () => new HttpResponse(null, { status: 204 }),
    )
    server.use(handleScheduleContractorRehire(rehireResolver))

    const { result } = renderRehireForm()

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let submitResult
    await act(async () => {
      assertReady(result.current)
      submitResult = await result.current.actions.onSubmit()
    })

    expect(rehireResolver).not.toHaveBeenCalled()
    expect(submitResult).toBeUndefined()
  })

  it('surfaces a mutation error via errorHandling', async () => {
    server.use(
      handleScheduleContractorRehire(
        () =>
          new HttpResponse(
            JSON.stringify({
              errors: [
                {
                  error_key: 'is_active',
                  category: 'invalid_operation',
                  message: 'Cannot reactivate while a rehire is scheduled.',
                },
              ],
            }),
            { status: 422 },
          ),
      ),
    )

    const { result } = renderRehireForm()

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      assertReady(result.current)
      result.current.form.hookFormInternals.formMethods.setValue('startDate', '2026-09-01')
    })

    await act(async () => {
      assertReady(result.current)
      await result.current.actions.onSubmit()
    })

    await waitFor(() => {
      expect(result.current.errorHandling.errors.length).toBeGreaterThan(0)
    })
  })
})
