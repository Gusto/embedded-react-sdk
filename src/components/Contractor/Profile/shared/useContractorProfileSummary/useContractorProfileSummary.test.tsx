import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { HttpResponse } from 'msw'
import { useContractorProfileSummary } from './useContractorProfileSummary'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { server } from '@/test/mocks/server'
import { handleGetContractor } from '@/test/mocks/apis/contractors'
import { setupApiTestMocks } from '@/test/mocks/apiServer'

describe('useContractorProfileSummary', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('starts in the loading branch and resolves into the ready branch with the contractor', async () => {
    const { result } = renderHook(
      () => useContractorProfileSummary({ contractorId: 'contractor-123' }),
      { wrapper: GustoTestProvider },
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    if (result.current.isLoading) return

    expect(result.current.data.contractor).toMatchObject({
      firstName: 'Kory',
      lastName: 'Gottlieb',
    })
    expect(result.current.status).toMatchObject({
      isFetching: false,
      isPending: false,
    })
  })

  it('surfaces a query failure through errorHandling.errors', async () => {
    server.use(
      handleGetContractor(() =>
        HttpResponse.json(
          { errors: [{ category: 'server_error', message: 'Boom' }] },
          { status: 500 },
        ),
      ),
    )

    const { result } = renderHook(
      () => useContractorProfileSummary({ contractorId: 'contractor-123' }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.errorHandling.errors.length).toBeGreaterThan(0)
    })

    expect(result.current.isLoading).toBe(true)
  })
})
