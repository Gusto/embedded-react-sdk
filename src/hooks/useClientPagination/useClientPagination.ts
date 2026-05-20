import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import type {
  PaginationControlProps,
  PaginationItemsPerPage,
} from '@/components/Common/PaginationControl/PaginationControlTypes'

interface UseClientPaginationOptions<TItem> {
  /**
   * Optional substring/fuzzy/etc. predicate run against the deferred,
   * trimmed search value. The hook owns search state and resets to page 1
   * whenever the value changes. A trimmed-empty value is treated as "no
   * search" and the predicate is not called. Omit to skip search entirely.
   */
  searchPredicate?: (item: TItem, query: string) => boolean
  /** Display rows-per-page. Default 5. */
  defaultItemsPerPage?: PaginationItemsPerPage
}

export interface UseClientPaginationResult<TItem> {
  /** Current-page slice. */
  data: TItem[]
  /** Drop-in `PaginationControlProps` for `useDataView` / `PaginationControl`. */
  pagination: PaginationControlProps
  /** Current search value (controlled). */
  searchValue: string
  actions: {
    onSearchChange: (value: string) => void
    onSearchClear: () => void
  }
}

/**
 * Client-side pagination + optional search over an in-memory array.
 *
 * Returns a `PaginationControlProps`-shaped pagination object that drops
 * straight into `useDataView` / `PaginationControl`. Use this when the
 * caller already has the full list of items and wants to paginate/search
 * it locally. Pair with `usePagination` if you want to page through an
 * API endpoint instead.
 */
export function useClientPagination<TItem>(
  allItems: TItem[],
  options: UseClientPaginationOptions<TItem> = {},
): UseClientPaginationResult<TItem> {
  const { searchPredicate, defaultItemsPerPage = 5 } = options

  const [searchValue, setSearchValue] = useState('')
  const deferredSearchValue = useDeferredValue(searchValue)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<PaginationItemsPerPage>(defaultItemsPerPage)

  const searchFilteredItems = useMemo<TItem[]>(() => {
    if (!searchPredicate) return allItems
    const trimmed = deferredSearchValue.trim()
    if (!trimmed) return allItems
    return allItems.filter(item => searchPredicate(item, trimmed))
  }, [allItems, deferredSearchValue, searchPredicate])

  const totalCount = searchFilteredItems.length
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage))
  // Clamp `currentPage` against the latest `totalPages` so a shrinking list
  // (e.g. after a search filter) doesn't leave the table on an empty page.
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const data = useMemo<TItem[]>(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage
    return searchFilteredItems.slice(start, start + itemsPerPage)
  }, [searchFilteredItems, safeCurrentPage, itemsPerPage])

  const pagination = useMemo<PaginationControlProps>(
    () => ({
      currentPage: safeCurrentPage,
      totalPages,
      totalCount,
      itemsPerPage,
      handleFirstPage: () => {
        setCurrentPage(1)
      },
      handleLastPage: () => {
        setCurrentPage(totalPages)
      },
      handleNextPage: () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages))
      },
      handlePreviousPage: () => {
        setCurrentPage(prev => Math.max(prev - 1, 1))
      },
      handleItemsPerPageChange: (value: PaginationItemsPerPage) => {
        if (value !== itemsPerPage) {
          setItemsPerPage(value)
          setCurrentPage(1)
        }
      },
    }),
    [safeCurrentPage, totalPages, totalCount, itemsPerPage],
  )

  const onSearchChange = useCallback((value: string) => {
    setSearchValue(value)
    setCurrentPage(1)
  }, [])

  const onSearchClear = useCallback(() => {
    setSearchValue('')
    setCurrentPage(1)
  }, [])

  const actions = useMemo(
    () => ({ onSearchChange, onSearchClear }),
    [onSearchChange, onSearchClear],
  )

  return {
    data,
    pagination,
    searchValue,
    actions,
  }
}
