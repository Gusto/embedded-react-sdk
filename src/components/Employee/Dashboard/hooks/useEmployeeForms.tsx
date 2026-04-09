import { useEmployeeFormsListSuspense } from '@gusto/embedded-api/react-query/employeeFormsList'
import type { Form } from '@gusto/embedded-api/models/components/form'
import { buildQueryErrorHandling } from '@/helpers/buildQueryErrorHandling'
import type { HookLoadingResult, BaseHookReady } from '@/types/sdkHooks'

export interface UseEmployeeFormsProps {
  employeeId: string
}

interface UseEmployeeFormsReady extends Omit<BaseHookReady, 'data' | 'status'> {
  data: {
    formList: Form[]
  }
  status: {
    isPending: boolean
  }
}

export type UseEmployeeFormsResult = HookLoadingResult | UseEmployeeFormsReady

export function useEmployeeForms({ employeeId }: UseEmployeeFormsProps): UseEmployeeFormsResult {
  const formsQuery = useEmployeeFormsListSuspense({ employeeId })

  const formList = formsQuery.data.formList

  const isPending = formsQuery.isFetching
  const isLoading = !formList && isPending

  const errorHandling = buildQueryErrorHandling([formsQuery])

  if (isLoading) {
    return {
      isLoading: true,
      errorHandling,
    }
  }

  return {
    isLoading: false,
    data: {
      formList: formList || [],
    },
    status: {
      isPending,
    },
    errorHandling,
  }
}
