import { useLocationsGetSuspense } from '@gusto/embedded-api/react-query/locationsGet'
import { type Location } from '@gusto/embedded-api/models/components/location.js'
import { useState } from 'react'
import { Head } from './Head'
import { List } from './List'
import { Actions } from './Actions'
import { useI18n } from '@/i18n'
import {
  BaseComponent,
  createCompoundContext,
  type BaseComponentInterface,
  CommonComponentInterface,
  useBase,
} from '@/components/Base/Base'
import { Flex } from '@/components/Common'
import { companyEvents } from '@/shared/constants'

type LocationsListContextType = {
  locationList: Location[]
  totalPages: number
  currentPage: number
  handleItemsPerPageChange: (n: number) => void
  handleFirstPage: () => void
  handlePreviousPage: () => void
  handleNextPage: () => void
  handleLastPage: () => void
  handleEditLocation: (uuid: string) => void
  handleAddLocation: () => void
  handleContinue: () => void
}

const [useLocationsList, LocationsListProvider] = createCompoundContext<LocationsListContextType>(
  'CompanyDocumentListContext',
)

export { useLocationsList }

interface LocationsListProps extends CommonComponentInterface {
  companyId: string
}

export function LocationsList({
  companyId,
  className,
  children,
  ...props
}: LocationsListProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root companyId={companyId} className={className}>
        {children}
      </Root>
    </BaseComponent>
  )
}

function Root({ companyId, className, children }: LocationsListProps) {
  useI18n('Company.Locations')
  const { onEvent } = useBase()

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  const {
    data: { locationList, httpMeta },
  } = useLocationsGetSuspense({ companyId, page: currentPage, per: itemsPerPage })

  const totalPages = Number(httpMeta.response.headers.get('x-total-pages') ?? 1)

  const handleItemsPerPageChange = (newCount: number) => {
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
          handleFirstPage,
          handlePreviousPage,
          handleNextPage,
          handleLastPage,
          handleItemsPerPageChange,
          handleAddLocation,
          handleEditLocation,
          handleContinue,
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

LocationsList.Head = Head
LocationsList.List = List
LocationsList.Actions = Actions
