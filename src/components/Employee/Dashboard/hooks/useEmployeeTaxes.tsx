import { useEmployeeTaxSetupGetFederalTaxes } from '@gusto/embedded-api-v-2025-11-15/react-query/employeeTaxSetupGetFederalTaxes'
import type { GetV1EmployeesEmployeeIdFederalTaxesResponse } from '@gusto/embedded-api-v-2025-11-15/models/operations/getv1employeesemployeeidfederaltaxes'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady } from '@/partner-hook-utils/types'

type EmployeeFederalTax = NonNullable<
  GetV1EmployeesEmployeeIdFederalTaxesResponse['employeeFederalTax']
>

export interface UseEmployeeTaxesProps {
  employeeId: string
}

export type UseEmployeeTaxesResult = BaseHookReady<
  {
    employeeFederalTax?: EmployeeFederalTax
  },
  {
    isPending: boolean
    isFederalTaxesLoading: boolean
  }
>

/**
 * Non-Suspense federal-taxes query for the Dashboard's Taxes tab. The
 * state-taxes card is now self-fetching via `useStateTaxesSummary` and
 * is rendered as a sibling of the federal `TaxesView`. When Federal
 * Taxes migrates to its own management block this hook can be deleted
 * and the federal card rendered inline alongside the state card.
 */
export function useEmployeeTaxes({ employeeId }: UseEmployeeTaxesProps): UseEmployeeTaxesResult {
  // staleTime: Infinity — the SDK QueryClient invalidates on any mutation
  // success, so we don't need TanStack Query to refetch on focus changes
  // or remounts inside the dashboard tabs.
  const federalTaxesQuery = useEmployeeTaxSetupGetFederalTaxes(
    { employeeUuid: employeeId },
    { staleTime: Infinity },
  )

  return {
    isLoading: false,
    data: {
      employeeFederalTax: federalTaxesQuery.data?.employeeFederalTax,
    },
    status: {
      isPending: federalTaxesQuery.isFetching,
      isFederalTaxesLoading: federalTaxesQuery.isLoading,
    },
    errorHandling: composeErrorHandler([federalTaxesQuery]),
  }
}
