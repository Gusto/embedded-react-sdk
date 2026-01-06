import { type Contractor } from '@gusto/embedded-api/models/components/contractor'
import { useContractorsListSuspense } from '@gusto/embedded-api/react-query/contractorsList'
import { useState } from 'react'
import type { PaginationItemsPerPage } from '@/components/Common/PaginationControl/PaginationControlTypes'
import { usePagination } from '@/hooks/usePagination'

export interface ContractorListContext {
  contractors: Contractor[]
}

export interface useContractorsArgs {
  companyUuid: string
}

export function useContractors({ companyUuid }: useContractorsArgs) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<PaginationItemsPerPage>(5)

  const {
    data: { httpMeta, contractorList: contractors },
  } = useContractorsListSuspense({ companyUuid, page: currentPage, per: itemsPerPage })

  const {
    totalPages,
    totalItems,
    handleFirstPage,
    handlePreviousPage,
    handleNextPage,
    handleLastPage,
    handleItemsPerPageChange,
  } = usePagination(httpMeta, {
    currentPage,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
  })

  return {
    contractors: contractors!,
    currentPage,
    handleFirstPage,
    handleItemsPerPageChange,
    handleLastPage,
    handleNextPage,
    handlePreviousPage,
    totalCount: totalItems,
    totalItems,
    totalPages,
    itemsPerPage,
  }
}
