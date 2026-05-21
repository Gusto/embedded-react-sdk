import { type Contractor } from '@gusto/embedded-api-v-2025-11-15/models/components/contractor'
import { useContractorsListSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/contractorsList'
import { usePagination } from '@/hooks/usePagination/usePagination'

export interface ContractorListContext {
  contractors: Contractor[]
}

export interface useContractorsArgs {
  companyUuid: string
}

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
