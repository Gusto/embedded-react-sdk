import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { HttpResponse } from 'msw'
import { useFederalTaxesSummary } from './useFederalTaxesSummary'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { server } from '@/test/mocks/server'
import { handleGetEmployeeFederalTaxes } from '@/test/mocks/apis/employee_federal_taxes'
import { setupApiTestMocks } from '@/test/mocks/apiServer'

const fixtureFederalTaxes = {
  version: 'federal-tax-version',
  filing_status: 'Single',
  extra_withholding: '0.0',
  two_jobs: false,
  dependents_amount: '0.0',
  other_income: '0.0',
  deductions: '0.0',
  employee_id: 29,
  w4_data_type: 'rev_2020_w4',
}

describe('useFederalTaxesSummary', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(handleGetEmployeeFederalTaxes(() => HttpResponse.json(fixtureFederalTaxes)))
  })

  it('starts in the loading branch and resolves into the ready branch with the federal-tax record', async () => {
    const { result } = renderHook(() => useFederalTaxesSummary({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    if (result.current.isLoading) return

    expect(result.current.data.employeeFederalTax).toMatchObject({
      filingStatus: 'Single',
      w4DataType: 'rev_2020_w4',
    })
    expect(result.current.status).toMatchObject({
      isFetching: false,
      isPending: false,
    })
  })

  it('surfaces a query failure through errorHandling.errors', async () => {
    server.use(
      handleGetEmployeeFederalTaxes(() =>
        HttpResponse.json(
          { errors: [{ category: 'server_error', message: 'Boom' }] },
          { status: 500 },
        ),
      ),
    )

    const { result } = renderHook(() => useFederalTaxesSummary({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.errorHandling.errors.length).toBeGreaterThan(0)
    })
  })
})
