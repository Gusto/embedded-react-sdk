import { useTranslation } from 'react-i18next'
import { VisuallyHidden } from 'react-aria'
import { useLocationsList } from './useLocationsList'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import { DataView, EmptyData, Hamburger, HamburgerItem, useDataView } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { getCityStateZip, getStreet } from '@/helpers/formattedStrings'

/**List of employees slot for EmployeeList component */
export const List = () => {
  const Components = useComponentContext()
  const {
    locationList,
    handleEditLocation,
    currentPage,
    totalPages,
    handleFirstPage,
    handleItemsPerPageChange,
    handleLastPage,
    handleNextPage,
    handlePreviousPage,
    handleAddLocation,
  } = useLocationsList()

  const { t } = useTranslation('Company.Locations')
  const { ...dataViewProps } = useDataView({
    data: locationList,
    columns: [
      {
        key: 'name',
        title: t('locationListCol1'),
        render: location => {
          return (
            <>
              <address>
                {getStreet(location)}
                <br />
                <small>{getCityStateZip(location)}</small>
              </address>
            </>
          )
        },
      },
      {
        key: 'status',
        title: <VisuallyHidden>{t('locationListCol2')}</VisuallyHidden>,
        render: location => {
          return (
            <>
              {location.mailingAddress && (
                <Components.Badge status={'info'}>{t('mailingAddress')}</Components.Badge>
              )}
              {location.filingAddress && (
                <Components.Badge status={'info'}>{t('filingAddress')}</Components.Badge>
              )}
            </>
          )
        },
      },
    ],
    itemMenu: location => {
      return (
        <Hamburger title={t('hamburgerTitle')} data-testid="location-hamburger">
          <HamburgerItem
            icon={<PencilSvg aria-hidden />}
            onAction={() => {
              handleEditLocation(location.uuid)
            }}
            data-testid="edit-location"
          >
            {t('editCta')}
          </HamburgerItem>
        </Hamburger>
      )
    },
    pagination: {
      handleNextPage,
      handleFirstPage,
      handleLastPage,
      handlePreviousPage,
      handleItemsPerPageChange,
      currentPage,
      totalPages,
    },
    emptyState: () => (
      <EmptyData title={t('emptyTableTitle')} description={t('emptyTableDescription')}>
        <Components.Button variant="secondary" onClick={handleAddLocation}>
          {t('addFirstLicationCta')}
        </Components.Button>
      </EmptyData>
    ),
  })
  return <DataView label={t('locationListLabel')} {...dataViewProps} />
}
