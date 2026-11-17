import { Component, type ReactNode } from 'react'
import { renderHook, render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HttpResponse } from 'msw'
import { useContractorTaxForms, type UseContractorTaxFormsResult } from './useContractorTaxForms'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { server } from '@/test/mocks/server'
import { handleGetContractorForms, build1099Form } from '@/test/mocks/apis/contractor_forms'
import { setupApiTestMocks } from '@/test/mocks/apiServer'

type ReadyResult = Extract<UseContractorTaxFormsResult, { isLoading: false }>

function assertReady(hookResult: UseContractorTaxFormsResult): asserts hookResult is ReadyResult {
  if (hookResult.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

class CatchBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    return this.state.hasError ? <p>Something went wrong</p> : this.props.children
  }
}

function TaxFormCount({ contractorId }: { contractorId: string }) {
  const taxForms = useContractorTaxForms({ contractorId })
  return <p>{taxForms.isLoading ? 'Loading' : `${taxForms.data.forms.length} forms`}</p>
}

describe('useContractorTaxForms', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('starts in the loading branch and resolves into the ready branch with the contractor 1099s', async () => {
    server.use(
      handleGetContractorForms(() =>
        HttpResponse.json([
          build1099Form(),
          build1099Form({ uuid: 'form-2', title: 'Form 1099: 2025', year: 2025 }),
        ]),
      ),
    )

    const { result } = renderHook(() => useContractorTaxForms({ contractorId: 'contractor-123' }), {
      wrapper: GustoTestProvider,
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.errorHandling.errors).toEqual([])

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    expect(result.current.data.forms).toHaveLength(2)
    expect(result.current.data.forms[0]).toMatchObject({
      uuid: 'form-1099-uuid',
      title: 'Form 1099: 2026',
      year: 2026,
    })
    expect(result.current.status).toMatchObject({ isFetching: false })
  })

  it('resolves to an empty list without an error when the token lacks the contractor_forms scope', async () => {
    server.use(
      handleGetContractorForms(
        () =>
          new HttpResponse(
            JSON.stringify({ errors: [{ category: 'missing_oauth_scopes', message: 'Denied' }] }),
            { status: 403 },
          ),
      ),
    )

    const { result } = renderHook(() => useContractorTaxForms({ contractorId: 'contractor-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    expect(result.current.data.forms).toEqual([])
    expect(result.current.errorHandling.errors).toEqual([])
  })

  it('throws a non-scope failure to the error boundary instead of reporting it on errorHandling', async () => {
    // React logs the caught render error; silence it so the suite output stays readable.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    server.use(
      handleGetContractorForms(
        () =>
          new HttpResponse(
            JSON.stringify({ errors: [{ category: 'server_error', message: 'Boom' }] }),
            { status: 500 },
          ),
      ),
    )

    render(
      <CatchBoundary>
        <TaxFormCount contractorId="contractor-123" />
      </CatchBoundary>,
      { wrapper: GustoTestProvider },
    )

    expect(await screen.findByText('Something went wrong')).toBeInTheDocument()
    consoleError.mockRestore()
  })
})
