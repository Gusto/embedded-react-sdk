import { useTranslation } from 'react-i18next'
import { useLocationsList } from './useLocationsList'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import { DataView, EmptyData, useDataView, VisuallyHidden } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
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
                <>
                  {' '}
                  <Components.Badge status={'info'}>{t('filingAddress')}</Components.Badge>
                </>
              )}
            </>
          )
        },
      },
    ],
    itemMenu: location => {
      return (
        <HamburgerMenu
          items={[
            {
              label: t('editCta'),
              onClick: () => {
                handleEditLocation(location.uuid)
              },
              icon: <PencilSvg aria-hidden />,
              'data-testid': 'edit-location',
            },
          ]}
          data-testid="location-hamburger"
          triggerLabel={t('hamburgerTitle')}
        />
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
