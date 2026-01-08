import { useLocationsGetSuspense } from '@gusto/embedded-api/react-query/locationsGet'
import { useState } from 'react'
import { Head } from './Head'
import { List } from './List'
import { Actions } from './Actions'
import { LocationsListProvider } from './useLocationsList'
import { useI18n } from '@/i18n'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { Flex } from '@/components/Common'
import { companyEvents } from '@/shared/constants'
import type { PaginationItemsPerPage } from '@/components/Common/PaginationControl/PaginationControlTypes'

interface LocationsListProps extends BaseComponentInterface {
  companyId: string
}

export function LocationsList(props: LocationsListProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ companyId, className, children }: LocationsListProps) {
  useI18n('Company.Locations')
  const { onEvent } = useBase()

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<PaginationItemsPerPage>(5)

  const {
    data: { locationList, httpMeta },
  } = useLocationsGetSuspense({ companyId, page: currentPage, per: itemsPerPage })

  const totalPages = Number(httpMeta.response.headers.get('x-total-pages') ?? 1)
  const totalCount = Number(httpMeta.response.headers.get('x-total-count') ?? 0)

  const handleItemsPerPageChange = (newCount: PaginationItemsPerPage) => {
    setItemsPerPage(newCount)
  }
  const handleFirstPage = () => {
    setCurrentPage(1)
  }
  const handlePreviousPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1))
  }
  const handleNextPage = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages))
  }
  const handleLastPage = () => {
    setCurrentPage(totalPages)
  }

  const handleContinue = () => {
    onEvent(companyEvents.COMPANY_LOCATION_DONE)
  }
  const handleAddLocation = () => {
    onEvent(companyEvents.COMPANY_LOCATION_CREATE)
  }
  const handleEditLocation = (uuid: string) => {
    onEvent(companyEvents.COMPANY_LOCATION_EDIT, { uuid })
  }

  return (
    <section className={className}>
      <LocationsListProvider
        value={{
          locationList: locationList ?? [],
          currentPage,
          totalPages,
          totalCount,
          handleFirstPage,
          handlePreviousPage,
          handleNextPage,
          handleLastPage,
          handleItemsPerPageChange,
          handleAddLocation,
          handleEditLocation,
          handleContinue,
          itemsPerPage,
        }}
      >
        <Flex flexDirection="column" gap={32}>
          {children ? (
            children
          ) : (
            <>
              <Head />
              <List />
              <Actions />
            </>
          )}
        </Flex>
      </LocationsListProvider>
    </section>
  )
}
