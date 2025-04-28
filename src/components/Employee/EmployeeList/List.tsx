import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import style from './List.module.scss'
import { useEmployeeList } from './useEmployeeList'
import {
  DataView,
  EmptyData,
  Hamburger,
  HamburgerItem,
  ActionsLayout,
  useDataView,
} from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import { EmployeeOnboardingStatus, EmployeeSelfOnboardingStatuses } from '@/shared/constants'
import { firstLastName } from '@/helpers/formattedStrings'

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
  const Components = useComponentContext()

  const { t } = useTranslation('Employee.EmployeeList')
  const [_, setDeleting] = useState<Set<string>>(new Set())
  const { ...dataViewProps } = useDataView({
    data: employees,
    columns: [
      {
        key: 'name',
        title: t('nameLabel'),
        render: employee => {
          return firstLastName({
            first_name: employee.firstName,
            last_name: employee.lastName,
          })
        },
      },
      {
        key: 'status',
        title: t('statusLabel'),
        render: employee => {
          return (
            <Components.Badge status={employee.onboarded ? 'success' : 'warning'}>
              {t(`onboardingStatus.${employee.onboardingStatus ?? 'undefined'}`, {
                ns: 'common',
              })}
            </Components.Badge>
          )
        },
      },
    ],
    itemMenu: employee => {
      return (
        <Hamburger title={t('hamburgerTitle')}>
          {employee.onboardingStatus === EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE ||
          employee.onboardingStatus === EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE ||
          employee.onboardingStatus ===
            EmployeeOnboardingStatus.SELF_ONBOARDING_AWAITING_ADMIN_REVIEW ||
          employee.onboardingStatus === EmployeeOnboardingStatus.ONBOARDING_COMPLETED ? (
            <HamburgerItem
              icon={<PencilSvg aria-hidden />}
              onAction={() => {
                handleEdit(employee.uuid, employee.onboardingStatus)
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
          {employee.onboardingStatus ===
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
        <Components.Button variant="secondary" onClick={handleNew}>
          {t('addEmployeeCTA')}
        </Components.Button>
      </EmptyData>
    ),
  })
  return (
    <>
      {employees.length > 0 && (
        <ActionsLayout>
          <Components.Button variant="secondary" onClick={handleNew}>
            {t('addAnotherCta')}
          </Components.Button>
        </ActionsLayout>
      )}
      <div className={style.container}>
        <DataView label={t('employeeListLabel')} {...dataViewProps} />
      </div>
    </>
  )
}
