import { type Contractor } from '@gusto/embedded-api/models/components/contractor'
import { useContractorsListSuspense } from '@gusto/embedded-api/react-query/contractorsList'
import { useState } from 'react'

export interface ContractorListContext {
  contractors: Contractor[]
}

export interface useContractorsArgs {
  companyUuid: string
}

export function useContractors({ companyUuid }: useContractorsArgs) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  const {
    data: { httpMeta, contractorList: contractors },
  } = useContractorsListSuspense({ companyUuid, page: currentPage, per: itemsPerPage })
  const totalPages = Number(httpMeta.response.headers.get('x-total-pages') ?? 1)
  const totalCount = Number(httpMeta.response.headers.get('x-total-count') ?? 1)

  const handleFirstPage = () => {
    setCurrentPage(1)
  }
  const handleLastPage = () => {
    setCurrentPage(totalPages)
  }
  const handleNextPage = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages))
  }
  const handlePreviousPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1))
  }

  return {
    contractors: contractors!,
    currentPage,
    handleFirstPage,
    handleItemsPerPageChange: setItemsPerPage,
    handleLastPage,
    handleNextPage,
    handlePreviousPage,
    totalCount,
    totalPages,
  }
}
