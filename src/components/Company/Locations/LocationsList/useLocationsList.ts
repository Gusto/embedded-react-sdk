import { type Location } from '@gusto/embedded-api/models/components/location'
import { createCompoundContext } from '@/components/Base'

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

export { useLocationsList, LocationsListProvider }
