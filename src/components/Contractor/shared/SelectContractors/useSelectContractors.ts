import { useCallback, useMemo, useState } from 'react'
import {
  buildContractorsListQuery,
  useContractorsList,
} from '@gusto/embedded-api/react-query/contractorsList'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { useQueries } from '@tanstack/react-query'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { useClientPagination } from '@/hooks/useClientPagination/useClientPagination'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { ContractorOnboardingStatus } from '@/shared/constants'
import type { HookLoadingResult, BaseHookReady } from '@/partner-hook-utils/types'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'

const SERVER_MAX_PER_PAGE = 100

/** @internal */
export function isEligibleContractor(contractor: Contractor): boolean {
  return (
    contractor.isActive &&
    contractor.onboardingStatus === ContractorOnboardingStatus.ONBOARDING_COMPLETED
  )
}

function matchesContractorSearch(contractor: Contractor, query: string): boolean {
  const name =
    contractor.businessName ?? `${contractor.firstName ?? ''} ${contractor.lastName ?? ''}`
  return name.toLowerCase().includes(query.toLowerCase())
}

/**
 * Ready state of {@link useSelectContractors}.
 *
 * @internal
 */
export interface UseSelectContractorsReady extends BaseHookReady<
  { contractors: Contractor[] },
  { isFetching: boolean }
> {
  /**
   * Count of eligible (active + onboarded) contractors across every page.
   * Unaffected by the current search — see `pagination.totalCount` for the
   * eligible-and-search-matching count instead.
   */
  eligibleCount: number
  /**
   * Currently selected contractor uuids. Always a subset of the current
   * eligible contractors: uuids for contractors that become ineligible or
   * disappear from the list on a refetch are dropped automatically.
   */
  selectedIds: Set<string>
  /** Pagination controls for the client-paginated, search-filtered contractor list. */
  pagination: PaginationControlProps
  /** Current search value. */
  searchValue: string
  /** Selection and search actions. */
  actions: {
    /** Selects or deselects a single contractor. */
    onSelect: (contractor: Contractor, checked: boolean) => void
    /** Selects or deselects every eligible contractor in the current search scope, across all pages. */
    onSelectAll: (checked: boolean) => void
    /** Updates the search value. */
    onSearchChange: (value: string) => void
    /** Clears the search value. */
    onSearchClear: () => void
  }
}

/** @internal */
export type UseSelectContractorsResult = HookLoadingResult | UseSelectContractorsReady

/**
 * Fetches every contractor page up front, filters to active + onboarded
 * contractors, and owns client-side pagination, search, and selection state
 * over the result.
 *
 * @remarks
 * `actions.onSelectAll` scopes to the full eligible, search-filtered list across
 * all pages, not just the current page slice — "select all" means every
 * matching contractor, including ones scrolled off-screen.
 *
 * @internal
 */
export function useSelectContractors(companyId: string): UseSelectContractorsResult {
  const gustoClient = useGustoEmbeddedContext()
  const [rawSelectedIds, setRawSelectedIds] = useState<Set<string>>(() => new Set())

  const firstPageQuery = useContractorsList({
    companyUuid: companyId,
    page: 1,
    per: SERVER_MAX_PER_PAGE,
  })
  const { data: firstPage, isFetching: isFirstPageFetching } = firstPageQuery

  const totalServerPages = Number(firstPage?.httpMeta.response.headers.get('x-total-pages') ?? 1)

  // No explicit concurrency cap: typical embedded customers are <100
  // contractors (one server page, zero extra requests). For larger companies
  // the browser's per-origin connection limit (~6) acts as the natural
  // ceiling. If this ever needs to support thousands of contractors,
  // reconsider — either a server-side eligibility filter or a paginated
  // fetch-as-you-scroll strategy would be the right escape hatches.
  const restPageResults = useQueries({
    queries: Array.from({ length: Math.max(0, totalServerPages - 1) }, (_, i) => ({
      ...buildContractorsListQuery(gustoClient, {
        companyUuid: companyId,
        page: i + 2,
        per: SERVER_MAX_PER_PAGE,
      }),
      enabled: !!firstPage,
    })),
  })

  const isLoading =
    (!firstPage && isFirstPageFetching) || restPageResults.some(r => !r.data && r.isFetching)

  const errorHandling = composeErrorHandler([firstPageQuery, ...restPageResults])

  const eligibleContractors = useMemo<Contractor[]>(() => {
    if (!firstPage) return []
    const contractors = [
      ...(firstPage.contractors ?? []),
      ...restPageResults.flatMap(r => r.data?.contractors ?? []),
    ]
    return contractors.filter(isEligibleContractor)
  }, [firstPage, restPageResults])

  const {
    data: filteredContractors,
    pagination,
    searchValue,
    actions: paginationActions,
  } = useClientPagination(eligibleContractors, {
    searchPredicate: matchesContractorSearch,
    defaultItemsPerPage: 25,
  })

  const isFetching = isFirstPageFetching || restPageResults.some(r => r.isFetching)

  const selectedIds = useMemo(() => {
    const validUuids = new Set(eligibleContractors.map(contractor => contractor.uuid))
    return new Set([...rawSelectedIds].filter(uuid => validUuids.has(uuid)))
  }, [rawSelectedIds, eligibleContractors])

  const onSelect = useCallback((contractor: Contractor, checked: boolean) => {
    setRawSelectedIds(prev => {
      const next = new Set(prev)
      if (checked) next.add(contractor.uuid)
      else next.delete(contractor.uuid)
      return next
    })
  }, [])

  const onSelectAll = useCallback(
    (checked: boolean) => {
      const scope = searchValue
        ? eligibleContractors.filter(contractor => matchesContractorSearch(contractor, searchValue))
        : eligibleContractors
      setRawSelectedIds(prev => {
        const next = new Set(prev)
        for (const contractor of scope) {
          if (checked) next.add(contractor.uuid)
          else next.delete(contractor.uuid)
        }
        return next
      })
    },
    [eligibleContractors, searchValue],
  )

  if (isLoading) {
    return {
      isLoading: true,
      errorHandling,
    }
  }

  return {
    isLoading: false,
    data: { contractors: filteredContractors },
    status: { isFetching },
    eligibleCount: eligibleContractors.length,
    selectedIds,
    pagination,
    searchValue,
    actions: {
      onSelect,
      onSelectAll,
      onSearchChange: paginationActions.onSearchChange,
      onSearchClear: paginationActions.onSearchClear,
    },
    errorHandling,
  }
}
