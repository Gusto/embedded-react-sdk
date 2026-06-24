import { useLocationsGetSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/locationsGet'
import { Head } from './Head'
import { List } from './List'
import { Actions } from './Actions'
import { LocationsListProvider } from './useLocationsList'
import { useI18n } from '@/i18n'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { Flex } from '@/components/Common'
import { companyEvents } from '@/shared/constants'
import { usePagination } from '@/hooks/usePagination/usePagination'

/**
 * Props for the {@link LocationsList} component.
 *
 * @public
 */
export interface LocationsListProps extends BaseComponentInterface<'Company.Locations'> {
  /** The associated company identifier. */
  companyId: string
}

/**
 * Displays the list of work locations for a company.
 *
 * @remarks
 * Standalone building block used internally by the orchestrated `Locations` component for its list view. Use this directly when you need full control over navigation between the list and form views.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/location/add` | A user chose to add a new location | — |
 * | `company/location/edit` | A user chose to edit a specific location | `{ uuid: string }` |
 * | `company/location/done` | The user chose to proceed to the next step | — |
 *
 * @param props - Component props including the `companyId` whose locations should be listed.
 * @returns The rendered locations list section.
 * @public
 */
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

  const { getPaginationProps } = usePagination()

  const {
    data: { companyLocationsList, httpMeta },
  } = useLocationsGetSuspense({ companyId })

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
          ...getPaginationProps(httpMeta.response.headers),
          locationList: companyLocationsList ?? [],
          handleAddLocation,
          handleEditLocation,
          handleContinue,
        }}
      >
        <Flex flexDirection="column" gap={32} alignItems="stretch">
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
