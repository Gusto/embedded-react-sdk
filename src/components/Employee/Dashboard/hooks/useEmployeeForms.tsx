import { useEmployeeFormsList } from '@gusto/embedded-api-v-2025-11-15/react-query/employeeFormsList'
import type { Form } from '@gusto/embedded-api-v-2025-11-15/models/components/form'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady } from '@/partner-hook-utils/types'

export interface UseEmployeeFormsProps {
  employeeId: string
}

export type UseEmployeeFormsResult = BaseHookReady<
  { formList: Form[] },
  { isPending: boolean; isFormsLoading: boolean }
>

/**
 * Phase B: non-Suspense query so the consuming view can paint its frame
 * (box header, tab structure) before the data arrives. The `formList`
 * defaults to `[]` while the query is loading — consumers branch on
 * `status.isFormsLoading` to distinguish "still loading" from "loaded
 * empty" and render a skeleton accordingly.
 */
export function useEmployeeForms({ employeeId }: UseEmployeeFormsProps): UseEmployeeFormsResult {
  // staleTime: Infinity — see useEmployeeCompensation for rationale (SDK
  // QueryClient invalidates on any mutation success).
  const formsQuery = useEmployeeFormsList({ employeeId }, { staleTime: Infinity })

  return {
    isLoading: false,
    data: {
      formList: formsQuery.data?.forms ?? [],
    },
    status: {
      isPending: formsQuery.isFetching,
      isFormsLoading: formsQuery.isLoading,
    },
    errorHandling: composeErrorHandler([formsQuery]),
  }
}
