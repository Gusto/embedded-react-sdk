import { useGarnishmentsList } from '@gusto/embedded-api/react-query/garnishmentsList'
import { useGarnishmentsUpdateMutation } from '@gusto/embedded-api/react-query/garnishmentsUpdate'
import type { Garnishment } from '@gusto/embedded-api/models/components/garnishment'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult, HookSubmitResult } from '@/partner-hook-utils/types'

export interface UseDeductionsListProps {
  employeeId: string
}

export interface DeductionsListDeleteResult {
  garnishment: Garnishment
  remainingActiveCount: number
}

export interface UseDeductionsListReady extends BaseHookReady<
  { deductions: Garnishment[] },
  { isFetching: boolean; isPending: boolean; deletingGarnishmentUuid?: string }
> {
  actions: {
    onDelete: (
      garnishment: Garnishment,
    ) => Promise<HookSubmitResult<DeductionsListDeleteResult> | undefined>
  }
}

export type UseDeductionsListResult = HookLoadingResult | UseDeductionsListReady

export function useDeductionsList({ employeeId }: UseDeductionsListProps): UseDeductionsListResult {
  const garnishmentsQuery = useGarnishmentsList({ employeeId })
  const updateMutation = useGarnishmentsUpdateMutation()

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('DeductionsList')

  const errorHandling = composeErrorHandler([garnishmentsQuery], {
    submitError,
    setSubmitError,
  })

  const onDelete = async (
    garnishment: Garnishment,
  ): Promise<HookSubmitResult<DeductionsListDeleteResult> | undefined> => {
    let result: HookSubmitResult<DeductionsListDeleteResult> | undefined
    await baseSubmitHandler(garnishment, async payload => {
      const response = await updateMutation.mutateAsync({
        request: {
          garnishmentId: payload.uuid as string,
          updateGarnishmentRequest: {
            ...payload,
            totalAmount: payload.totalAmount ?? undefined,
            active: false,
            version: payload.version as string,
          },
        },
      })
      const updated = (response.garnishment ?? payload) as Garnishment
      const currentDeductions = garnishmentsQuery.data?.garnishments ?? []
      const remainingActiveCount = currentDeductions.filter(
        g => g.active && g.uuid !== updated.uuid,
      ).length
      result = {
        mode: 'update',
        data: { garnishment: updated, remainingActiveCount },
      }
    })
    return result
  }

  const deletingGarnishmentUuid = updateMutation.isPending
    ? updateMutation.variables.request.garnishmentId
    : undefined

  const allDeductions = garnishmentsQuery.data?.garnishments

  if (garnishmentsQuery.isLoading || !allDeductions) {
    return { isLoading: true, errorHandling }
  }

  const deductions = allDeductions.filter(g => g.active)

  return {
    isLoading: false,
    data: { deductions },
    status: {
      isFetching: garnishmentsQuery.isFetching,
      isPending: updateMutation.isPending,
      deletingGarnishmentUuid,
    },
    actions: { onDelete },
    errorHandling,
  }
}
