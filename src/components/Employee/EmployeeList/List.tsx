import {
  DataView,
  EmptyData,
  Badge,
  Hamburger,
  HamburgerItem,
  ActionsLayout,
  Button,
  useDataView,
} from '@/components/Common'
import { useEmployeeList } from '@/components/Employee/EmployeeList/EmployeeList'
import { useTranslation } from 'react-i18next'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import { useState } from 'react'
import { EmployeeOnboardingStatus, EmployeeSelfOnboardingStatuses } from '@/shared/constants'
import { firstLastName } from '@/helpers/formattedStrings'

import style from './List.module.scss'

/**List of employees slot for EmployeeList component */
export const List = () => {
  const {
    handleDelete,
    employees,
    handleEdit,
    handleReview,
    handleNew,
    handleCancelSelfOnboarding,
    handleFirstPage,
    handlePreviousPage,
    handleNextPage,
    handleLastPage,
    handleItemsPerPageChange,
    currentPage,
    totalPages,
  } = useEmployeeList()

  const { t } = useTranslation('Employee.EmployeeList')
  const [deleting, setDeleting] = useState<Set<string>>(new Set())
  const { ...dataViewProps } = useDataView({
    data: employees,
    columns: [
      {
        key: 'name',
        title: t('nameLabel'),
        render: employee => {
          return firstLastName(employee)
        },
      },
      {
        key: 'status',
        title: t('statusLabel'),
        render: employee => {
          return (
            <Badge
              variant={employee.onboarded ? 'success' : 'warning'}
              text={t(`onboardingStatus.${employee.onboarding_status ?? 'undefined'}`, {
                ns: 'common',
              })}
            />
          )
        },
      },
    ],
    itemMenu: employee => {
      return (
        <Hamburger title={t('hamburgerTitle')}>
          {employee.onboarding_status === EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE ||
          employee.onboarding_status === EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE ||
          employee.onboarding_status ===
            EmployeeOnboardingStatus.SELF_ONBOARDING_AWAITING_ADMIN_REVIEW ||
          employee.onboarding_status === EmployeeOnboardingStatus.ONBOARDING_COMPLETED ? (
            <HamburgerItem
              icon={<PencilSvg aria-hidden />}
              onAction={() => {
                handleEdit(employee.uuid, employee.onboarding_status)
              }}
            >
              {t('editCta')}
            </HamburgerItem>
          ) : null}
          {/* @ts-expect-error: onboarding_status during runtime can be one of self onboarding statuses */}
          {EmployeeSelfOnboardingStatuses.has(employee.onboarding_status ?? '') ? (
            <HamburgerItem
              icon={<PencilSvg aria-hidden />}
              onAction={async () => {
                await handleCancelSelfOnboarding(employee.uuid)
              }}
            >
              {t('cancelSelfOnboardingCta')}
            </HamburgerItem>
          ) : null}
          {employee.onboarding_status ===
          EmployeeOnboardingStatus.SELF_ONBOARDING_COMPLETED_BY_EMPLOYEE ? (
            <HamburgerItem
              icon={<PencilSvg aria-hidden />}
              onAction={() => {
                void handleReview(employee.uuid)
              }}
            >
              {t('reviewCta')}
            </HamburgerItem>
          ) : null}

          {!employee.onboarded && (
            <HamburgerItem
              icon={<TrashCanSvg aria-hidden />}
              onAction={() => {
                setDeleting(prev => prev.add(employee.uuid))
                void handleDelete(employee.uuid).then(() => {
                  setDeleting(prev => {
                    prev.delete(employee.uuid)
                    return prev
                  })
                })
              }}
            >
              {t('deleteCta')}
            </HamburgerItem>
          )}
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
        <Button onPress={handleNew} variant="secondary">
          {t('addEmployeeCTA')}
        </Button>
      </EmptyData>
    ),
  })
  return (
    <>
      {employees.length > 0 && (
        <ActionsLayout>
          <Button variant="secondary" onPress={handleNew}>
            {t('addAnotherCta')}
          </Button>
        </ActionsLayout>
      )}
      <div className={style.container}>
        <DataView label={t('employeeListLabel')} {...dataViewProps} />
      </div>
    </>
  )
}
