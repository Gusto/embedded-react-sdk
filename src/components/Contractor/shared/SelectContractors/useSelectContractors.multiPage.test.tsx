import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type * as ReactQuery from '@tanstack/react-query'
import type * as GustoContext from '@gusto/embedded-api/react-query/_context'
import type { ReactNode } from 'react'
import { useSelectContractors } from './useSelectContractors'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { ContractorOnboardingStatus } from '@/shared/constants'

// This file exercises the multi-page fetch path in useSelectContractors:
// - reads x-total-pages from the first page's response headers
// - issues additional queries via useQueries for pages 2..N
// - merges all pages into a single eligible-contractor list

vi.mock('@/i18n/I18n', () => ({
  useI18n: vi.fn(),
}))

function makeContractor(uuid: string, firstName: string) {
  return {
    uuid,
    isActive: true,
    onboardingStatus: ContractorOnboardingStatus.ONBOARDING_COMPLETED,
    firstName,
    lastName: 'Contractor',
  }
}

const page1Contractors = [makeContractor('1', 'Page1')]
const page2Contractors = [makeContractor('2', 'Page2')]

let mockTotalPages = 1
const buildContractorsListQueryMock = vi.fn()

vi.mock('@gusto/embedded-api/react-query/contractorsList', () => ({
  useContractorsList: () => ({
    data: {
      contractors: page1Contractors,
      httpMeta: {
        response: {
          headers: new Headers({ 'x-total-pages': String(mockTotalPages) }),
        },
      },
    },
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  }),
  buildContractorsListQuery: (...args: unknown[]) => {
    buildContractorsListQueryMock(...args)
    return {
      queryKey: ['mock-contractors-list', args],
      queryFn: () => Promise.resolve({ contractors: page2Contractors }),
    }
  },
}))

vi.mock('@gusto/embedded-api/react-query/_context', async importOriginal => {
  const actual = await importOriginal<typeof GustoContext>()
  return {
    ...actual,
    useGustoEmbeddedContext: () => ({}),
  }
})

vi.mock('@tanstack/react-query', async importActual => {
  const actual = await importActual<typeof ReactQuery>()
  return {
    ...actual,
    useQueries: ({ queries }: { queries: unknown[] }) =>
      queries.map(() => ({
        data: { contractors: page2Contractors },
        isFetching: false,
        error: null,
        refetch: vi.fn(),
      })),
  }
})

function wrapper({ children }: { children: ReactNode }) {
  return <GustoTestProvider>{children}</GustoTestProvider>
}

describe('useSelectContractors multi-page fetching', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTotalPages = 1
  })

  test('does not call buildContractorsListQuery when x-total-pages is 1', () => {
    mockTotalPages = 1
    const { result } = renderHook(() => useSelectContractors('company-123'), { wrapper })

    expect(buildContractorsListQueryMock).not.toHaveBeenCalled()
    if (result.current.isLoading) throw new Error('expected ready state')
    expect(result.current.eligibleCount).toBe(1)
    expect(result.current.data.contractors.map(c => c.uuid)).toEqual(['1'])
  })

  test('issues queries for pages 2..N when x-total-pages > 1', () => {
    mockTotalPages = 3
    renderHook(() => useSelectContractors('company-123'), { wrapper })

    // Pages 2 and 3 each get a buildContractorsListQuery call. React 18 strict
    // mode can double-invoke renders, so assert on the unique page numbers
    // requested rather than the raw call count.
    const requestedPages = new Set(
      buildContractorsListQueryMock.mock.calls.map(
        (call: unknown[]) => (call[1] as { page: number }).page,
      ),
    )
    expect(requestedPages).toEqual(new Set([2, 3]))
  })

  test('merges contractors from all server pages into the eligible list', () => {
    mockTotalPages = 2
    const { result } = renderHook(() => useSelectContractors('company-123'), { wrapper })

    if (result.current.isLoading) throw new Error('expected ready state')
    expect(result.current.eligibleCount).toBe(2)
    expect(result.current.data.contractors.map(c => c.uuid)).toEqual(['1', '2'])
  })
})
