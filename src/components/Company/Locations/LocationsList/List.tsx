import { useTranslation } from 'react-i18next'
import { VisuallyHidden } from 'react-aria'
import { useLocationsList } from './LocationsList'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import {
  Badge,
  Button,
  DataView,
  EmptyData,
  Hamburger,
  HamburgerItem,
  useDataView,
} from '@/components/Common'
import { getCityStateZip, getStreet } from '@/helpers/formattedStrings'

/**List of employees slot for EmployeeList component */
export const List = () => {
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
              {location.mailingAddress && <Badge variant={'info'} text={t('mailingAddress')} />}
              {location.filingAddress && <Badge variant={'info'} text={t('filingAddress')} />}
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
        <Button onPress={handleAddLocation} variant="secondary">
          {t('addFirstLicationCta')}
        </Button>
      </EmptyData>
    ),
  })
  return <DataView label={t('locationListLabel')} {...dataViewProps} />
}
