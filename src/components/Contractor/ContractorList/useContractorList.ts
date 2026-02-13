import { type Contractor } from '@gusto/embedded-api/models/components/contractor'
import { useContractorsListSuspense } from '@gusto/embedded-api/react-query/contractorsList'
import { useContractorsDeleteMutation } from '@gusto/embedded-api/react-query/contractorsDelete'
import { useState } from 'react'
import { useBase } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { type EventType, componentEvents } from '@/shared/constants'
import type { PaginationItemsPerPage } from '@/components/Common/PaginationControl/PaginationControlTypes'

export interface ContractorListContext {
  contractors: Contractor[]
}

export interface UseContractorListProps {
  companyUuid: string
  onEvent?: OnEventType<EventType, unknown>
}

export function useContractorList({ companyUuid }: UseContractorListProps) {
  const { onEvent, baseSubmitHandler } = useBase()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<PaginationItemsPerPage>(5)

  const {
    data: { httpMeta, contractorList: contractors },
  } = useContractorsListSuspense({ companyUuid, page: currentPage, per: itemsPerPage })
  const totalPages = Number(httpMeta.response.headers.get('x-total-pages') ?? 1)
  const totalCount = Number(httpMeta.response.headers.get('x-total-count') ?? 1)

  const { mutateAsync: deleteContractorMutation, isPending: isPendingDelete } =
    useContractorsDeleteMutation()

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

  const handleAdd = () => {
    onEvent(componentEvents.CONTRACTOR_CREATE)
  }

  const handleEdit = (uuid: string) => {
    onEvent(componentEvents.CONTRACTOR_UPDATE, { contractorId: uuid })
  }

  const handleContinue = () => {
    onEvent(componentEvents.CONTRACTOR_ONBOARDING_CONTINUE)
  }

  const handleDelete = async (uuid: string) => {
    await baseSubmitHandler(uuid, async payload => {
      await deleteContractorMutation({
        request: { contractorUuid: payload },
      })

      onEvent(componentEvents.CONTRACTOR_DELETED, { contractorId: payload })
    })
  }

  return {
    data: {
      contractors: contractors!,
      totalPages,
      totalCount,
    },
    actions: {
      handleAdd,
      handleEdit,
      handleContinue,
      handleDelete,
    },
    meta: {
      isPending: isPendingDelete,
    },
    pagination: {
      currentPage,
      itemsPerPage,
      handleFirstPage,
      handlePreviousPage,
      handleNextPage,
      handleLastPage,
      handleItemsPerPageChange: setItemsPerPage,
      totalPages,
      totalCount,
    },
  }
}
