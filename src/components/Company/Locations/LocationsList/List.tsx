// import { useTranslation } from 'react-i18next'
// import {
//   DataView,
//   EmptyData,
//   Badge,
//   Hamburger,
//   HamburgerItem,
//   ActionsLayout,
//   Button,
//   useDataView,
// } from '@/components/Common'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import styles from './List.module.scss'
// import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
// import { EmployeeOnboardingStatus, EmployeeSelfOnboardingStatuses } from '@/shared/constants'
// import { firstLastName } from '@/helpers/formattedStrings'

import { useTranslation } from "react-i18next";
import { useLocationsList } from "./LocationsList"
import { Badge, Button, DataView, EmptyData, Hamburger, HamburgerItem, useDataView } from "@/components/Common";
import { getCityStateZip, getStreet } from "@/helpers/formattedStrings";

/**List of employees slot for EmployeeList component */
export const List = () => {

  const { locationList } = useLocationsList();

  const { t } = useTranslation('Company.Locations')
  // const [_, setDeleting] = useState<Set<string>>(new Set())
  const { ...dataViewProps } = useDataView({
    data: locationList,
    columns: [
      {
        key: 'name',
        title: t('locationListCol1'),
        render: location => {
          return <>
           <address >
        <p>{getStreet(location)}</p>
        <small>{getCityStateZip(location)}</small>
      </address></>
        },
      },
      {
        key: 'status',
        title: '',
        render: location => {
          return (<>
            {location.filingAddress && (<Badge
              variant={'info'}
              text={t('filingAddress')}
            />)}
            {location.mailingAddress && (<Badge
              variant={'info'}
              text={t('mailingAddress')}
            />)}
          </>)
        },
      },
    ],
    itemMenu: location => {
      return (
        <Hamburger title={t('hamburgerTitle')}>
            <HamburgerItem
              icon={<PencilSvg aria-hidden />}
              onAction={() => {
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
        <Button onPress={() => { }} variant="secondary">
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
