import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { OnboardingStatus } from '@gusto/embedded-api/models/operations/putv1employeesemployeeidonboardingstatus'
import { DataView, EmptyData, ActionsLayout, useDataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { EmployeeOnboardingStatusBadge } from '@/components/Common/OnboardingStatusBadge'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import { EmployeeOnboardingStatus, EmployeeSelfOnboardingStatuses } from '@/shared/constants'
import { firstLastName } from '@/helpers/formattedStrings'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'

export interface EmployeeListViewProps {
  mode: 'onboarding'
  employees: Employee[]
  isFetching: boolean
  pagination: PaginationControlProps
  status: {
    isPending: boolean
  }
  onEdit: (employeeId: string, onboardingStatus?: OnboardingStatus) => void
  onDelete: (employeeId: string) => Promise<void>
  onCancelSelfOnboarding: (employeeId: string) => Promise<void>
  onReview: (employeeId: string) => Promise<void>
  onAddEmployee: () => void
  onSkip: () => void
}

export function EmployeeListView({
  employees,
  isFetching,
  pagination,
  status,
  onEdit,
  onDelete,
  onCancelSelfOnboarding,
  onReview,
  onAddEmployee,
  onSkip,
}: EmployeeListViewProps) {
  const { t } = useTranslation('Employee.EmployeeList')
  const Components = useComponentContext()
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null)

  const { ...dataViewProps } = useDataView({
    data: employees,
    columns: [
      {
        key: 'name',
        title: t('nameLabel'),
        render: (employee: Employee) => {
          return firstLastName({
            first_name: employee.firstName,
            last_name: employee.lastName,
          })
        },
      },
      {
        key: 'status',
        title: t('statusLabel'),
        render: (employee: Employee) => (
          <EmployeeOnboardingStatusBadge
            onboarded={employee.onboarded}
            onboardingStatus={employee.onboardingStatus}
          />
        ),
      },
    ],
    itemMenu: employee => {
      const menuItems = []

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
            onEdit(employee.uuid, employee.onboardingStatus ?? undefined)
          },
          icon: <PencilSvg aria-hidden />,
        })
      }

      if (
        employee.onboardingStatus &&
        // @ts-expect-error: onboardingStatus during runtime can be one of self onboarding statuses
        EmployeeSelfOnboardingStatuses.has(employee.onboardingStatus)
      ) {
        menuItems.push({
          label: t('cancelSelfOnboardingCta'),
          onClick: () => {
            void onCancelSelfOnboarding(employee.uuid)
          },
          icon: <PencilSvg aria-hidden />,
        })
      }

      if (
        employee.onboardingStatus === EmployeeOnboardingStatus.SELF_ONBOARDING_COMPLETED_BY_EMPLOYEE
      ) {
        menuItems.push({
          label: t('reviewCta'),
          onClick: () => {
            void onReview(employee.uuid)
          },
          icon: <PencilSvg aria-hidden />,
        })
      }

      if (!employee.onboarded) {
        menuItems.push({
          label: t('deleteCta'),
          onClick: () => {
            setEmployeeToDelete(employee.uuid)
          },
          icon: <TrashCanSvg aria-hidden />,
        })
      }

      return <HamburgerMenu items={menuItems} triggerLabel={t('hamburgerTitle')} />
    },
    isFetching,
    pagination,
    emptyState: () => (
      <EmptyData title={t('emptyTableTitle')} description={t('emptyTableDescription')}>
        <ActionsLayout justifyContent="center">
          <Components.Button variant="secondary" onClick={onSkip}>
            {t('skipCta')}
          </Components.Button>
          <Components.Button variant="primary" onClick={onAddEmployee}>
            {t('addEmployeeCta')}
          </Components.Button>
        </ActionsLayout>
      </EmptyData>
    ),
  })

  return (
    <>
      <Flex flexDirection="column" gap={24}>
        <Components.Heading as="h2">{t('title')}</Components.Heading>

        {employees.length > 0 && (
          <ActionsLayout>
            <Components.Button variant="secondary" onClick={onAddEmployee}>
              {t('addAnotherCta')}
            </Components.Button>
          </ActionsLayout>
        )}

        <DataView label={t('employeeListLabel')} {...dataViewProps} />

        {employees.length > 0 && (
          <ActionsLayout>
            <Components.Button onClick={onSkip}>{t('continueCta')}</Components.Button>
          </ActionsLayout>
        )}
      </Flex>

      <Components.Dialog
        isOpen={!!employeeToDelete}
        onClose={() => {
          setEmployeeToDelete(null)
        }}
        onPrimaryActionClick={() => {
          if (employeeToDelete) {
            void onDelete(employeeToDelete).then(() => {
              setEmployeeToDelete(null)
            })
          }
        }}
        isPrimaryActionLoading={status.isPending}
        isDestructive
        title={t('deleteDialog.title')}
        primaryActionLabel={t('deleteDialog.confirmCta')}
        closeActionLabel={t('deleteDialog.cancelCta')}
      >
        {t('deleteDialog.description')}
      </Components.Dialog>
    </>
  )
}
