import { type Location } from '@gusto/embedded-api/models/components/location'
import { createCompoundContext } from '@/components/Base'
import type { PaginationItemsPerPage } from '@/components/Common/PaginationControl/PaginationControlTypes'

type LocationsListContextType = {
  locationList: Location[]
  totalPages: number
  totalItems: number
  currentPage: number
  itemsPerPage: PaginationItemsPerPage
  handleItemsPerPageChange: (n: PaginationItemsPerPage) => void
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

export { useLocationsList, LocationsListProvider }
