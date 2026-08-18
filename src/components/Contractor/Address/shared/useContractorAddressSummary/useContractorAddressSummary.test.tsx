import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { HttpResponse } from 'msw'
import { useContractorAddressSummary } from './useContractorAddressSummary'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { server } from '@/test/mocks/server'
import { handleGetContractorAddress } from '@/test/mocks/apis/contractor_address'
import { setupApiTestMocks } from '@/test/mocks/apiServer'

const fullAddressResponse = {
  version: 'contractor-address-version',
  contractor_uuid: 'contractor_id',
  street_1: '999 Kiera Stravenue',
  street_2: 'Suite 541',
  city: 'San Francisco',
  state: 'CA',
  zip: '94107',
  country: 'USA',
  active: true,
}

describe('useContractorAddressSummary', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(handleGetContractorAddress(() => HttpResponse.json(fullAddressResponse)))
  })

  it('starts in the loading branch and resolves into the ready branch with the address', async () => {
    const { result } = renderHook(
      () => useContractorAddressSummary({ contractorId: 'contractor_id' }),
      { wrapper: GustoTestProvider },
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    if (result.current.isLoading) return

    expect(result.current.data.contractorAddress).toMatchObject({
      street1: '999 Kiera Stravenue',
      city: 'San Francisco',
      state: 'CA',
      zip: '94107',
    })
    expect(result.current.data.contractorType).toBe('Individual')
    expect(result.current.status).toMatchObject({
      isFetching: false,
      isPending: false,
    })
  })

  it('surfaces a query failure through errorHandling.errors', async () => {
    server.use(
      handleGetContractorAddress(() =>
        HttpResponse.json(
          { errors: [{ category: 'server_error', message: 'Boom' }] },
          { status: 500 },
        ),
      ),
    )

    const { result } = renderHook(
      () => useContractorAddressSummary({ contractorId: 'contractor_id' }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.errorHandling.errors.length).toBeGreaterThan(0)
    })

    expect(result.current.isLoading).toBe(true)
  })
})
