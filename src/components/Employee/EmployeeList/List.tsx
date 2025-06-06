import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import style from './List.module.scss'
import { useEmployeeList } from './useEmployeeList'
import { DataView, EmptyData, ActionsLayout, useDataView } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
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
    handleSkip,
  } = useEmployeeList()
  const Components = useComponentContext()

  const { t } = useTranslation('Employee.EmployeeList')
  const [deleting, setDeleting] = useState<Set<string>>(new Set())
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
      const menuItems = []

      // Edit item
      if (
        employee.onboardingStatus === EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE ||
        employee.onboardingStatus === EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE ||
        employee.onboardingStatus ===
          EmployeeOnboardingStatus.SELF_ONBOARDING_AWAITING_ADMIN_REVIEW ||
        employee.onboardingStatus === EmployeeOnboardingStatus.ONBOARDING_COMPLETED
      ) {
        menuItems.push({
          label: t('editCta'),
          onClick: () => {
            handleEdit(employee.uuid, employee.onboardingStatus ?? undefined)
          },
          icon: <PencilSvg aria-hidden />,
        })
      }

      // Cancel self onboarding item
      /* @ts-expect-error: onboarding_status during runtime can be one of self onboarding statuses */
      if (EmployeeSelfOnboardingStatuses.has(employee.onboarding_status ?? '')) {
        menuItems.push({
          label: t('cancelSelfOnboardingCta'),
          onClick: async () => {
            await handleCancelSelfOnboarding(employee.uuid)
          },
          icon: <PencilSvg aria-hidden />,
        })
      }

      // Review item
      if (
        employee.onboardingStatus === EmployeeOnboardingStatus.SELF_ONBOARDING_COMPLETED_BY_EMPLOYEE
      ) {
        menuItems.push({
          label: t('reviewCta'),
          onClick: () => {
            void handleReview(employee.uuid)
          },
          icon: <PencilSvg aria-hidden />,
        })
      }

      // Delete item
      if (!employee.onboarded) {
        menuItems.push({
          label: t('deleteCta'),
          onClick: () => {
            setDeleting(prev => new Set(prev).add(employee.uuid))
            void handleDelete(employee.uuid).then(() => {
              setDeleting(prev => {
                const newSet = new Set(prev)
                newSet.delete(employee.uuid)
                return newSet
              })
            })
          },
          icon: <TrashCanSvg aria-hidden />,
        })
      }

      return (
        <HamburgerMenu
          items={menuItems}
          triggerLabel={t('hamburgerTitle')}
          isLoading={deleting.has(employee.uuid)}
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
        <ActionsLayout justifyContent="center">
          <Components.Button variant="secondary" onClick={handleSkip}>
            {t('skipCta')}
          </Components.Button>
          <Components.Button variant="primary" onClick={handleNew}>
            {t('addEmployeeCTA')}
          </Components.Button>
        </ActionsLayout>
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
