import { useTranslation } from 'react-i18next'
import styles from './List.module.scss'
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
  const { locationList, handleEditLocation } = useLocationsList()

  const { t } = useTranslation('Company.Locations')
  // const [_, setDeleting] = useState<Set<string>>(new Set())
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
                <p>{getStreet(location)}</p>
                <small>{getCityStateZip(location)}</small>
              </address>
            </>
          )
        },
      },
      {
        key: 'status',
        title: '',
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
        <Hamburger title={t('hamburgerTitle')}>
          <HamburgerItem
            icon={<PencilSvg aria-hidden />}
            onAction={() => {
              handleEditLocation(location.uuid)
            }}
          >
            {t('editCta')}
          </HamburgerItem>
        </Hamburger>
      )
    },
    // pagination: {
    //   handleNextPage,
    //   handleFirstPage,
    //   handleLastPage,
    //   handlePreviousPage,
    //   handleItemsPerPageChange,
    //   currentPage,
    //   totalPages,
    // },
    emptyState: () => (
      <EmptyData title={t('emptyTableTitle')} description={t('emptyTableDescription')}>
        <Button onPress={() => {}} variant="secondary">
          {t('addLocationCTA')}
        </Button>
      </EmptyData>
    ),
  })
  return (
    <>
      {/* {locationList.length > 0 && (
        <ActionsLayout>
          <Button variant="secondary" onPress={handleNew}>
            {t('addAnotherCta')}
          </Button>
        </ActionsLayout>
      )} */}
      <div className={styles.container}>
        <DataView label={t('locationListLabel')} {...dataViewProps} />
      </div>
    </>
  )
}
