import { useEmployeeFormsList } from '@gusto/embedded-api-v-2026-06-15/react-query/employeeFormsList'
import type { Form } from '@gusto/embedded-api-v-2026-06-15/models/components/form'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

/**
 * Parameters for {@link useDocumentsList}.
 *
 * @public
 */
export interface UseDocumentsListParams {
  /** The associated employee identifier. */
  employeeId: string
}

type UseDocumentsListReady = BaseHookReady<{ forms: Form[] }, { isFetching: boolean }>

/**
 * Result of {@link useDocumentsList} — a discriminated union of loading and ready states.
 *
 * @public
 */
export type UseDocumentsListResult = HookLoadingResult | UseDocumentsListReady

/**
 * Standalone data hook for an employee's forms (documents).
 *
 * @remarks
 * Wraps the `employeeFormsList` query in the standard `BaseHookReady` shape.
 * Read-only — viewing or signing a form is handled by the screen the parent
 * routes to, so this hook exposes no actions.
 *
 * @param params - See {@link UseDocumentsListParams}.
 * @returns A {@link HookLoadingResult} while loading, or the ready state with `data.forms` once loaded.
 * @public
 */
export function useDocumentsList({ employeeId }: UseDocumentsListParams): UseDocumentsListResult {
  // staleTime: Infinity — the SDK QueryClient invalidates on any mutation
  // success, so a long stale time avoids redundant refetches on remount.
  const formsQuery = useEmployeeFormsList({ employeeId }, { staleTime: Infinity })

  const errorHandling = composeErrorHandler([formsQuery])

  if (formsQuery.isLoading) {
    return { isLoading: true, errorHandling }
  }

  return {
    isLoading: false,
    data: { forms: formsQuery.data?.forms ?? [] },
    status: { isFetching: formsQuery.isFetching },
    errorHandling,
  }
}
