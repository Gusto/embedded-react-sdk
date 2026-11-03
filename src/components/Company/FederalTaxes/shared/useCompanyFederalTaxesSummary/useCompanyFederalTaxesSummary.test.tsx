import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { HttpResponse } from 'msw'
import { useCompanyFederalTaxesSummary } from './useCompanyFederalTaxesSummary'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { server } from '@/test/mocks/server'
import { handleGetCompanyFederalTaxes } from '@/test/mocks/apis/company_federal_taxes'
import { setupApiTestMocks } from '@/test/mocks/apiServer'

const federalTaxesResponse = {
  version: '36d35e28689e641e9e153f0324c2625a',
  tax_payer_type: 'Sole proprietor',
  taxable_as_scorp: false,
  filing_form: '944',
  has_ein: true,
  ein_verified: false,
  legal_name: 'foobarbaz',
}

describe('useCompanyFederalTaxesSummary', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(handleGetCompanyFederalTaxes(() => HttpResponse.json(federalTaxesResponse)))
  })

  it('starts in the loading branch and resolves into the ready branch with the tax details', async () => {
    const { result } = renderHook(
      () => useCompanyFederalTaxesSummary({ companyId: 'company-123' }),
      { wrapper: GustoTestProvider },
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    if (result.current.isLoading) return

    expect(result.current.data.federalTaxDetails).toMatchObject({
      legalName: 'foobarbaz',
      taxPayerType: 'Sole proprietor',
      filingForm: '944',
      hasEin: true,
      einVerified: false,
    })
    expect(result.current.status).toMatchObject({ isPending: false })
  })

  it('surfaces a query error through errorHandling', async () => {
    server.use(handleGetCompanyFederalTaxes(() => new HttpResponse(null, { status: 500 })))

    const { result } = renderHook(
      () => useCompanyFederalTaxesSummary({ companyId: 'company-123' }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.errorHandling.errors).toBeTruthy()
    })
  })
})
