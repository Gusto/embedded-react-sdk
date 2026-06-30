import { useContractorsListSuspense } from '@gusto/embedded-api-v-2026-06-15/react-query/contractorsList'
import { usePagination } from '@/hooks/usePagination/usePagination'

/** @internal */
export interface useContractorsArgs {
  companyUuid: string
}

/** @internal */
export function useContractors({ companyUuid }: useContractorsArgs) {
  const { currentPage, itemsPerPage, getPaginationProps } = usePagination()

  const {
    data: { httpMeta, contractors },
  } = useContractorsListSuspense({ companyUuid, page: currentPage, per: itemsPerPage })

  return {
    contractors: contractors!,
    ...getPaginationProps(httpMeta.response.headers),
  }
}
