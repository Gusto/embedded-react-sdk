import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { HttpResponse } from 'msw'
import { useCompanyLocationsSummary } from './useCompanyLocationsSummary'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { server } from '@/test/mocks/server'
import { basicLocation, handleGetCompanyLocations } from '@/test/mocks/apis/company_locations'
import { setupApiTestMocks } from '@/test/mocks/apiServer'

describe('useCompanyLocationsSummary', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(handleGetCompanyLocations(() => HttpResponse.json([basicLocation])))
  })

  it('starts in the loading branch and resolves into the ready branch with the locations', async () => {
    const { result } = renderHook(() => useCompanyLocationsSummary({ companyId: 'company-123' }), {
      wrapper: GustoTestProvider,
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    if (result.current.isLoading) return

    expect(result.current.data.locations).toHaveLength(1)
    expect(result.current.data.locations[0]).toMatchObject({
      street1: '123 Main St',
      street2: 'Apt 101',
      city: 'Anytown',
      zip: '12345',
      mailingAddress: true,
      filingAddress: false,
    })
  })

  it('returns an empty list when the company has no locations', async () => {
    server.use(handleGetCompanyLocations(() => HttpResponse.json([])))

    const { result } = renderHook(() => useCompanyLocationsSummary({ companyId: 'company-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    if (result.current.isLoading) return

    expect(result.current.data.locations).toEqual([])
  })

  it('surfaces a query error through errorHandling', async () => {
    server.use(handleGetCompanyLocations(() => new HttpResponse(null, { status: 500 })))

    const { result } = renderHook(() => useCompanyLocationsSummary({ companyId: 'company-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.errorHandling.errors).toBeTruthy()
    })
  })
})
