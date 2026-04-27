import { createCompoundContext } from '@/components/Base'

type LocationsFormContextType = {
  isPending: boolean
  handleCancel: () => void
  isMailingLocked: boolean
  isFilingLocked: boolean
}

const [useLocationsForm, LocationsFormProvider] = createCompoundContext<LocationsFormContextType>(
  'CompanyDocumentFormContext',
)

export { useLocationsForm, LocationsFormProvider }
