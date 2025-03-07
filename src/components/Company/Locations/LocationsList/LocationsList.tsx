import { useLocationsGetSuspense } from '@gusto/embedded-api/react-query/locationsGet'
import { type Location } from '@gusto/embedded-api/models/components/location.js'
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
  handleEditLocation: () => void
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
  //TODO: add pagination
  const { data } = useLocationsGetSuspense({ companyId })
  const { locationList } = data

  const handleEditLocation = () => {
    onEvent(companyEvents.COMPANY_EDIT_LOCATION)
  }
  return (
    <section className={className}>
      <LocationsListProvider
        value={{
          locationList: locationList ?? [],
          handleEditLocation,
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
