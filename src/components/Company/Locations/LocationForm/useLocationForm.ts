import { createCompoundContext } from '@/components/Base'

type LocationsFormContextType = {
  isPending: boolean
  handleCancel: () => void
}

const [useLocationsForm, LocationsFormProvider] = createCompoundContext<LocationsFormContextType>(
  'CompanyDocumentFormContext',
)

export { useLocationsForm, LocationsFormProvider }
