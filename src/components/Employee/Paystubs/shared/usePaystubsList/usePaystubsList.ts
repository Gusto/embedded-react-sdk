import { useGustoEmbeddedContext } from '@gusto/embedded-api-v-2026-06-15/react-query/_context'
import { usePayrollsGetPayStubs } from '@gusto/embedded-api-v-2026-06-15/react-query/payrollsGetPayStubs'
import { payrollsGetPayStub } from '@gusto/embedded-api-v-2026-06-15/funcs/payrollsGetPayStub'
import { useCallback, useMemo } from 'react'
import type { GetV1EmployeesEmployeeUuidPayStubsResponse } from '@gusto/embedded-api-v-2026-06-15/models/operations/getv1employeesemployeeuuidpaystubs'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { readableStreamToBlob } from '@/helpers/readableStreamToBlob'
import { usePagination } from '@/hooks/usePagination/usePagination'
import type { BaseHookReady, HookLoadingResult, HookSubmitResult } from '@/partner-hook-utils/types'
import type {
  PaginationControlProps,
  PaginationItemsPerPage,
} from '@/components/Common/PaginationControl/PaginationControlTypes'

/**
 * A single paystub entry returned by {@link usePaystubsList}.
 *
 * @public
 */
export type EmployeePayStub = NonNullable<
  GetV1EmployeesEmployeeUuidPayStubsResponse['employeePayStubsList']
>[number]

/**
 * Parameters for {@link usePaystubsList}.
 *
 * @public
 */
export interface UsePaystubsListParams {
  /** The associated employee identifier. */
  employeeId: string
  /** Items per page for the paystubs list. Defaults to 10. */
  defaultItemsPerPage?: PaginationItemsPerPage
}

/**
 * Ready-state shape returned by {@link usePaystubsList} once data has loaded.
 *
 * @public
 */
export interface UsePaystubsListReady extends BaseHookReady<
  { payStubs: EmployeePayStub[] },
  { isFetching: boolean; isPending: boolean }
> {
  /** Pagination controls for the paystubs list. */
  pagination: { payStubs?: PaginationControlProps }
  /** Actions exposed by the hook. */
  actions: {
    /** Fetch the paystub PDF for the given payroll. Returns a Blob on success
     * so the caller decides how to surface it (open in a new tab, save to
     * disk, embed, etc.). */
    downloadPayStub: (payrollId: string) => Promise<HookSubmitResult<Blob> | undefined>
  }
}

/**
 * Return type of {@link usePaystubsList}.
 *
 * @public
 */
export type UsePaystubsListResult = HookLoadingResult | UsePaystubsListReady

/**
 * Data hook for the employee paystubs list. Returns the paginated list of
 * paystubs and an action to download an individual paystub PDF. Used by the
 * standalone `PaystubsCard` component and consumable directly by partners
 * building a fully custom paystubs UI.
 *
 * @public
 */
export function usePaystubsList({
  employeeId,
  defaultItemsPerPage = 10,
}: UsePaystubsListParams): UsePaystubsListResult {
  const { currentPage, itemsPerPage, getPaginationProps } = usePagination({
    defaultItemsPerPage,
  })

  const gustoEmbedded = useGustoEmbeddedContext()
  const payStubsQuery = usePayrollsGetPayStubs(
    { employeeId, page: currentPage, per: itemsPerPage },
    { staleTime: Infinity },
  )

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('PaystubsList')

  const payStubs = payStubsQuery.data?.employeePayStubsList ?? []

  const payStubsPagination = useMemo(() => {
    const headers = payStubsQuery.data?.httpMeta.response.headers
    if (!headers) return undefined
    return getPaginationProps(headers, payStubsQuery.isFetching)
  }, [payStubsQuery.data?.httpMeta.response.headers, payStubsQuery.isFetching, getPaginationProps])

  const errorHandling = composeErrorHandler([payStubsQuery], { submitError, setSubmitError })

  const downloadPayStub = useCallback(
    async (payrollId: string): Promise<HookSubmitResult<Blob> | undefined> => {
      let submitResult: HookSubmitResult<Blob> | undefined
      await baseSubmitHandler(payrollId, async id => {
        const response = await payrollsGetPayStub(gustoEmbedded, { payrollId: id, employeeId })
        // `funcs/payrollsGetPayStub` returns a Result discriminated union;
        // surface API/validation errors so `baseSubmitHandler` can route them
        // through the standard SDK error pipeline instead of bubbling to the
        // error boundary as an unknown throw.
        if (!response.ok) {
          throw response.error
        }
        if (!response.value.responseStream) {
          throw new Error('Pay stub response missing PDF stream')
        }
        const pdfBlob = await readableStreamToBlob(response.value.responseStream, 'application/pdf')
        submitResult = { mode: 'update', data: pdfBlob }
      })
      return submitResult
    },
    [baseSubmitHandler, gustoEmbedded, employeeId],
  )

  if (payStubsQuery.isLoading) {
    return { isLoading: true, errorHandling }
  }

  return {
    isLoading: false,
    data: { payStubs },
    status: {
      isFetching: payStubsQuery.isFetching,
      isPending: false,
    },
    pagination: { payStubs: payStubsPagination },
    actions: { downloadPayStub },
    errorHandling,
  }
}
