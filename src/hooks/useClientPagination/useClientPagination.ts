import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import type {
  PaginationControlProps,
  PaginationItemsPerPage,
} from '@/components/Common/PaginationControl/PaginationControlTypes'

const DEFAULT_SEARCH_DEBOUNCE_MS = 120

interface UseClientPaginationOptions<TItem> {
  /**
   * Optional substring/fuzzy/etc. predicate run against the debounced,
   * deferred, trimmed search value. The hook owns search state and
   * resets to page 1 once the debounce settles. A trimmed-empty value is
   * treated as "no search" and the predicate is not called. Omit to skip
   * search entirely.
   */
  searchPredicate?: (item: TItem, query: string) => boolean
  /** Display rows-per-page. Default 5. */
  defaultItemsPerPage?: PaginationItemsPerPage
  /**
   * Debounce window (ms) applied to the search value before it reaches
   * the predicate and page reset. Keeps the controlled input responsive
   * while preventing the filter from running on every keystroke for
   * large lists or expensive predicates. Defaults to 120ms. Pass 0 to
   * disable debouncing entirely (useful for tests).
   */
  searchDebounceMs?: number
}

/**
 * Return shape of {@link useClientPagination}: the current-page slice, a
 * `PaginationControlProps`-shaped object, the controlled search value, and
 * search actions.
 *
 * @typeParam TItem - The element type of the paginated list.
 * @internal
 */
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
 * Client-side pagination and optional search over an in-memory array.
 *
 * @remarks
 * Returns a `PaginationControlProps`-shaped pagination object that drops
 * straight into `useDataView` / `PaginationControl`. Use this when the
 * caller already has the full list of items and wants to paginate/search
 * it locally. Pair with `usePagination` if you want to page through an
 * API endpoint instead.
 *
 * Search state is owned by the hook, debounced, and resets the current
 * page to 1 once the debounce settles. The current page is clamped to the
 * latest total so a shrinking filtered list never lands on an empty page.
 *
 * @typeParam TItem - The element type of the paginated list.
 * @param allItems - The full in-memory list to paginate and optionally filter.
 * @param options - Search predicate, default rows-per-page, and debounce window.
 * @returns A {@link UseClientPaginationResult} with the current-page slice,
 *   pagination controls, the controlled search value, and search actions.
 * @internal
 */
export function useClientPagination<TItem>(
  allItems: TItem[],
  options: UseClientPaginationOptions<TItem> = {},
): UseClientPaginationResult<TItem> {
  const {
    searchPredicate,
    defaultItemsPerPage = 5,
    searchDebounceMs = DEFAULT_SEARCH_DEBOUNCE_MS,
  } = options

  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('')
  const deferredSearchValue = useDeferredValue(debouncedSearchValue)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<PaginationItemsPerPage>(defaultItemsPerPage)

  useEffect(() => {
    if (searchDebounceMs <= 0) {
      setDebouncedSearchValue(prev => (prev === searchValue ? prev : searchValue))
      setCurrentPage(prev => (prev === 1 ? prev : 1))
      return
    }
    const timeoutId = setTimeout(() => {
      setDebouncedSearchValue(prev => (prev === searchValue ? prev : searchValue))
      setCurrentPage(prev => (prev === 1 ? prev : 1))
    }, searchDebounceMs)
    return () => {
      clearTimeout(timeoutId)
    }
  }, [searchValue, searchDebounceMs])

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
  }, [])

  const onSearchClear = useCallback(() => {
    setSearchValue('')
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
