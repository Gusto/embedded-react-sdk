import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { HttpResponse } from 'msw'
import { useCompanyIndustrySummary } from './useCompanyIndustrySummary'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { server } from '@/test/mocks/server'
import { handleGetIndustrySelection } from '@/test/mocks/apis/company'
import { setupApiTestMocks } from '@/test/mocks/apiServer'

// The industry endpoint returns the industry object as the response body itself;
// the SDK nests it under `industry` when parsing.
const industryResponse = {
  company_uuid: 'company-123',
  naics_code: '541511',
  title: 'Custom Computer Programming Services',
  sic_codes: ['7371'],
}

describe('useCompanyIndustrySummary', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(handleGetIndustrySelection(() => HttpResponse.json(industryResponse)))
  })

  it('starts in the loading branch and resolves into the ready branch with the industry', async () => {
    const { result } = renderHook(() => useCompanyIndustrySummary({ companyId: 'company-123' }), {
      wrapper: GustoTestProvider,
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    if (result.current.isLoading) return

    expect(result.current.data.industry).toMatchObject({
      naicsCode: '541511',
      title: 'Custom Computer Programming Services',
      sicCodes: ['7371'],
    })
    expect(result.current.status).toMatchObject({ isPending: false })
  })

  it('surfaces a query error through errorHandling', async () => {
    server.use(handleGetIndustrySelection(() => new HttpResponse(null, { status: 500 })))

    const { result } = renderHook(() => useCompanyIndustrySummary({ companyId: 'company-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.errorHandling.errors).toBeTruthy()
    })
  })
})
