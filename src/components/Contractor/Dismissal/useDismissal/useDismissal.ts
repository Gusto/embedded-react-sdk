import { useContractorsGet } from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorsPostV1ContractorsContractorUuidTerminationMutation } from '@gusto/embedded-api/react-query/contractorsPostV1ContractorsContractorUuidTermination'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult, HookSubmitResult } from '@/partner-hook-utils/types'
import { formatDateToStringDate } from '@/helpers/dateFormatting'
import { GENERIC_API_ERROR_MESSAGE } from '@/types/sdkError'

/**
 * Props for {@link useDismissal}.
 *
 * @public
 */
export interface UseDismissalProps {
  /** The contractor identifier to dismiss. */
  contractorId: string
}

/**
 * Ready state of {@link useDismissal}.
 *
 * @public
 */
export interface UseDismissalReady extends BaseHookReady<
  { contractor: Contractor },
  { isPending: boolean }
> {
  /** Actions available when the hook has loaded. */
  actions: {
    /** Schedules a dismissal effective on `endDate`. */
    dismiss: (endDate: Date) => Promise<HookSubmitResult<unknown> | undefined>
  }
}

/**
 * Return type of {@link useDismissal}.
 *
 * @public
 */
export type UseDismissalResult = HookLoadingResult | UseDismissalReady

/**
 * Fetches a contractor and exposes an action to schedule their dismissal.
 *
 * @param input - The contractor to dismiss.
 * @returns A {@link HookLoadingResult} while the contractor is being fetched, or a {@link UseDismissalReady} once it has arrived.
 * @public
 */
export function useDismissal({ contractorId }: UseDismissalProps): UseDismissalResult {
  const contractorQuery = useContractorsGet({ contractorUuid: contractorId })
  const dismissMutation = useContractorsPostV1ContractorsContractorUuidTerminationMutation()

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('Contractor.Dismissal')

  const errorHandling = composeErrorHandler([contractorQuery], { submitError, setSubmitError })

  const isPending = dismissMutation.isPending

  const dismiss = async (endDate: Date): Promise<HookSubmitResult<unknown> | undefined> => {
    let submitResult: HookSubmitResult<unknown> | undefined

    await baseSubmitHandler(endDate, async date => {
      await dismissMutation.mutateAsync({
        request: {
          contractorUuid: contractorId,
          requestBody: { endDate: new RFCDate(formatDateToStringDate(date)!) },
        },
      })
      submitResult = { mode: 'create', data: undefined }
    })

    return submitResult
  }

  const { data, isLoading } = contractorQuery

  if (isLoading || !data?.contractor) {
    // A settled query (not `isLoading`) with no query `error` but also no `contractor` in the
    // response body would otherwise report `isLoading: true` forever with an empty error list —
    // `contractor` is optional on the response type, so this isn't a thrown error we'd catch via
    // `composeErrorHandler`. Surface it as an error so the host sees a real failure state instead
    // of a stuck spinner.
    const settledWithNoContractor = !isLoading && !contractorQuery.error
    return {
      isLoading: true,
      errorHandling: settledWithNoContractor
        ? {
            ...errorHandling,
            errors: [
              ...errorHandling.errors,
              { category: 'internal_error', message: GENERIC_API_ERROR_MESSAGE, fieldErrors: [] },
            ],
          }
        : errorHandling,
    }
  }

  return {
    isLoading: false,
    data: { contractor: data.contractor },
    status: { isPending },
    actions: { dismiss },
    errorHandling,
  }
}
