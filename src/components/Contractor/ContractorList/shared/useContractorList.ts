import { useMemo, useState } from 'react'
import { useContractorsList } from '@gusto/embedded-api/react-query/contractorsList'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import type { ContractorOnboardingStatus as ContractorOnboardingStatusEntity } from '@gusto/embedded-api/models/components/contractoronboardingstatus'
import { useContractorsDeleteMutation } from '@gusto/embedded-api/react-query/contractorsDelete'
import { useContractorsUpdateOnboardingStatusMutation } from '@gusto/embedded-api/react-query/contractorsUpdateOnboardingStatus'
import { useContractorsDeleteV1ContractorsContractorUuidTerminationMutation } from '@gusto/embedded-api/react-query/contractorsDeleteV1ContractorsContractorUuidTermination'
import { useContractorsDeleteV1ContractorsContractorUuidRehireMutation } from '@gusto/embedded-api/react-query/contractorsDeleteV1ContractorsContractorUuidRehire'
import { keepPreviousData } from '@tanstack/react-query'
import { usePagination } from '@/hooks/usePagination/usePagination'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'
import type { TableSortDirection } from '@/components/Common/UI/Table/TableTypes'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { ContractorOnboardingStatus } from '@/shared/constants'
import type { HookLoadingResult, BaseHookReady } from '@/partner-hook-utils/types'

/**
 * Action that may be performed on a contractor row, determined by the contractor's onboarding
 * and employment state and the `contractorType` filter passed to {@link useContractorList}.
 *
 * @public
 */
export type ContractorAction =
  | 'edit'
  | 'delete'
  | 'cancel_self_onboarding'
  | 'view'
  | 'dismiss'
  | 'rehire'
  | 'cancel_dismissal'
  | 'cancel_rehire'

/**
 * A contractor entity extended with the actions permitted on it.
 *
 * @public
 */
export interface ContractorWithActions extends Contractor {
  /** Actions permitted for this contractor given its onboarding/employment state and the active filter. */
  allowedActions: ContractorAction[]
}

/**
 * Filter applied to {@link useContractorList} that scopes the result set and tailors the per-row action list.
 *
 * @public
 */
export type ContractorType = 'active' | 'onboarding' | 'terminated'

/**
 * Field the contractor list can be sorted by.
 *
 * @remarks
 * `'name'` sorts by last name for individual contractors and by business name for business
 * contractors, matching how each row is labelled.
 *
 * @public
 */
export type ContractorSortField = 'name'

/**
 * Sort applied to {@link useContractorList}.
 *
 * @public
 */
export interface ContractorListSort {
  /** Field the list is ordered by. */
  field: ContractorSortField
  /** Direction the field is ordered in. */
  direction: TableSortDirection
}

/**
 * Props for {@link useContractorList}.
 *
 * @public
 */
export interface UseContractorListProps {
  /** The associated company identifier. */
  companyId: string
  /** Filters the list and tailors the allowed actions. Omit to list every contractor. */
  contractorType?: ContractorType
}

/**
 * Ready state of {@link useContractorList}.
 *
 * @public
 */
export interface UseContractorListReady extends BaseHookReady<
  { contractors: ContractorWithActions[] },
  { isFetching: boolean; isPending: boolean }
> {
  /** Pagination controls for the current contractor list page. */
  pagination: PaginationControlProps
  /** Server-side sort state for the list, and the setter that re-queries with a new sort. */
  sort: {
    /** The active sort, or `undefined` while the list is in the API's default order. */
    current?: ContractorListSort
    /** Applies a new sort and returns to page 1. */
    onSortChange: (sort: ContractorListSort) => void
  }
  /** Actions that mutate a contractor's state, gated by the entry's `allowedActions`. */
  actions: {
    /** Deletes the contractor. */
    onDelete: (contractorId: string) => Promise<void>
    /** Reverts a self-onboarding contractor to admin-driven onboarding. Resolves to the updated record, or `undefined` if the call failed. */
    onCancelSelfOnboarding: (
      contractorId: string,
    ) => Promise<ContractorOnboardingStatusEntity | undefined>
    /** Cancels a contractor's scheduled dismissal. */
    onCancelDismissal: (contractorId: string) => Promise<void>
    /** Cancels a contractor's scheduled rehire. */
    onCancelRehire: (contractorId: string) => Promise<void>
  }
}

/**
 * Return type of {@link useContractorList}.
 *
 * @public
 */
export type UseContractorListResult = HookLoadingResult | UseContractorListReady

const SORT_DIRECTION_PARAM = {
  ascending: 'asc',
  descending: 'desc',
} as const satisfies Record<TableSortDirection, string>

const SELF_ONBOARDING_CANCELLABLE_STATUSES = new Set<string>([
  ContractorOnboardingStatus.SELF_ONBOARDING_INVITED,
  ContractorOnboardingStatus.SELF_ONBOARDING_STARTED,
])

function deriveAllowedActions(
  contractor: Contractor,
  contractorType?: ContractorType,
): ContractorAction[] {
  const actions: ContractorAction[] = []
  const status = contractor.onboardingStatus

  if (contractorType === 'active') {
    actions.push('view')

    if (contractor.upcomingEmployment && contractor.rehireCancellationEligible) {
      actions.push('cancel_rehire')
    } else if (contractor.dismissalDate && contractor.dismissalCancellationEligible) {
      actions.push('cancel_dismissal')
    } else if (!contractor.dismissalDate && !contractor.upcomingEmployment) {
      actions.push('dismiss')
    }

    return actions
  }

  if (contractorType === 'terminated') {
    actions.push('view')

    if (contractor.upcomingEmployment) {
      if (contractor.rehireCancellationEligible) {
        actions.push('cancel_rehire')
      }
    } else if (contractor.dismissalCancellationEligible) {
      actions.push('cancel_dismissal')
    } else if (!contractor.isActive) {
      actions.push('rehire')
    }

    return actions
  }

  // 'onboarding' filter and the unfiltered (undefined) onboarding-flavor list share the same
  // edit / cancel_self_onboarding / delete logic used by today's onboarding ContractorList.
  const canCancelSelfOnboarding = !!status && SELF_ONBOARDING_CANCELLABLE_STATUSES.has(status)

  if (!canCancelSelfOnboarding) {
    actions.push('edit')
  } else {
    actions.push('cancel_self_onboarding')
  }

  actions.push('delete')

  if (
    contractorType === 'onboarding' &&
    status === ContractorOnboardingStatus.ONBOARDING_COMPLETED
  ) {
    actions.push('view')
  }

  return actions
}

/**
 * Fetches a paginated list of a company's contractors and decorates each entry with the actions
 * allowed for its current onboarding/employment state.
 *
 * @remarks
 * `contractorType` maps to a server-side filter and changes which actions appear on each row:
 * `'active'` exposes `view` plus `dismiss`/`cancel_dismissal`/`cancel_rehire`, `'terminated'`
 * exposes `view` plus `rehire`/`cancel_dismissal`/`cancel_rehire`, `'onboarding'` and the
 * unfiltered default expose `edit`/`cancel_self_onboarding`/`delete`. Omit `contractorType` to
 * list every contractor.
 *
 * Page changes use placeholder data: the previous page stays rendered while the next one loads,
 * and `status.isFetching` flips to `true` during the request.
 *
 * Sorting is applied by the API, so the order holds across pages. No sort is requested until
 * `sort.onSortChange` is called, leaving the list in the API's default order until then, and
 * applying a new sort returns to page 1 because the API sorts before it paginates. The sort
 * persists across `contractorType` changes, since every filter sorts by the same field.
 *
 * The endpoint rejects a sort combined with a search term (HTTP 422), so a search filter added
 * here would have to clear the sort.
 *
 * @param input - Company and optional filter for the list.
 * @returns A {@link HookLoadingResult} while the first page is in flight, or a {@link UseContractorListReady} once data has arrived.
 * @public
 */
export function useContractorList({
  companyId,
  contractorType,
}: UseContractorListProps): UseContractorListResult {
  const { currentPage, itemsPerPage, getPaginationProps, resetPage } = usePagination()
  const [sort, setSort] = useState<ContractorListSort | undefined>()

  const queryParams = useMemo(() => {
    const baseParams = {
      companyUuid: companyId,
      page: currentPage,
      per: itemsPerPage,
      // Spread conditionally rather than passing `sortBy: undefined`, so an unsorted list
      // sends no `sort_by` at all and keeps the query key it had before sorting existed.
      ...(sort ? { sortBy: `${sort.field}:${SORT_DIRECTION_PARAM[sort.direction]}` } : {}),
    }

    switch (contractorType) {
      case 'active':
        return { ...baseParams, onboardedActive: true }
      case 'onboarding':
        return { ...baseParams, onboarded: false }
      case 'terminated':
        return { ...baseParams, terminated: true }
      default:
        return baseParams
    }
  }, [companyId, currentPage, itemsPerPage, contractorType, sort])

  const contractorsQuery = useContractorsList(queryParams, { placeholderData: keepPreviousData })

  const deleteContractorMutation = useContractorsDeleteMutation()
  const updateOnboardingStatusMutation = useContractorsUpdateOnboardingStatusMutation()
  const cancelDismissalMutation =
    useContractorsDeleteV1ContractorsContractorUuidTerminationMutation()
  const cancelRehireMutation = useContractorsDeleteV1ContractorsContractorUuidRehireMutation()

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('ContractorList')

  const errorHandling = composeErrorHandler([contractorsQuery], { submitError, setSubmitError })

  const isPending =
    deleteContractorMutation.isPending ||
    updateOnboardingStatusMutation.isPending ||
    cancelDismissalMutation.isPending ||
    cancelRehireMutation.isPending

  const { data, isFetching } = contractorsQuery

  const contractors = useMemo<ContractorWithActions[]>(() => {
    return (data?.contractors ?? []).map(contractor => ({
      ...contractor,
      allowedActions: deriveAllowedActions(contractor, contractorType),
    }))
  }, [data?.contractors, contractorType])

  const paginationProps = data?.httpMeta.response.headers
    ? getPaginationProps(data.httpMeta.response.headers, isFetching)
    : {
        handleNextPage: () => {},
        handleFirstPage: () => {},
        handleLastPage: () => {},
        handlePreviousPage: () => {},
        handleItemsPerPageChange: () => {},
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        itemsPerPage: 5 as const,
      }

  const onDelete = async (contractorId: string): Promise<void> => {
    await baseSubmitHandler(contractorId, async id => {
      await deleteContractorMutation.mutateAsync({
        request: { contractorUuid: id },
      })
    })
  }

  const onCancelSelfOnboarding = async (
    contractorId: string,
  ): Promise<ContractorOnboardingStatusEntity | undefined> => {
    let onboardingStatus: ContractorOnboardingStatusEntity | undefined

    await baseSubmitHandler(contractorId, async id => {
      const result = await updateOnboardingStatusMutation.mutateAsync({
        request: {
          contractorUuid: id,
          contractorOnboardingStatusUpdateRequestBody: {
            onboardingStatus: ContractorOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
          },
        },
      })

      onboardingStatus = result.contractorOnboardingStatus
    })

    return onboardingStatus
  }

  const onCancelDismissal = async (contractorId: string): Promise<void> => {
    await baseSubmitHandler(contractorId, async id => {
      await cancelDismissalMutation.mutateAsync({
        request: { contractorUuid: id },
      })
    })
  }

  const onCancelRehire = async (contractorId: string): Promise<void> => {
    await baseSubmitHandler(contractorId, async id => {
      await cancelRehireMutation.mutateAsync({
        request: { contractorUuid: id },
      })
    })
  }

  const onSortChange = (nextSort: ContractorListSort) => {
    setSort(nextSort)
    // The API sorts before paginating, so the current page index means nothing under a new order.
    resetPage()
  }

  const isLoading = !data && isFetching

  if (isLoading) {
    return {
      isLoading: true,
      errorHandling,
    }
  }

  return {
    isLoading: false,
    data: {
      contractors,
    },
    pagination: paginationProps,
    sort: { current: sort, onSortChange },
    status: { isFetching, isPending },
    actions: { onDelete, onCancelSelfOnboarding, onCancelDismissal, onCancelRehire },
    errorHandling,
  }
}
