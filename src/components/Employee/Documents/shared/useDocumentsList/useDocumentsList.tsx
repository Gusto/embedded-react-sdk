import { useEmployeeFormsList } from '@gusto/embedded-api-v-2025-11-15/react-query/employeeFormsList'
import type { Form } from '@gusto/embedded-api-v-2025-11-15/models/components/form'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

export interface UseDocumentsListParams {
  employeeId: string
}

type UseDocumentsListReady = BaseHookReady<{ forms: Form[] }, { isFetching: boolean }>

export type UseDocumentsListResult = HookLoadingResult | UseDocumentsListReady

/**
 * Standalone data hook for an employee's forms (documents). Wraps the
 * `employeeFormsList` query in the `BaseHookReady` shape consumed by both the
 * SDK's {@link DocumentsCard} and partners building a fully custom documents
 * surface. Read-only — viewing or signing a form is handled by the
 * `DocumentManager` screen the block routes to, so this hook exposes no actions.
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
