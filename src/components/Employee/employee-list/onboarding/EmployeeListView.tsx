import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { OnboardingStatus } from '@gusto/embedded-api/models/operations/putv1employeesemployeeidonboardingstatus'
import type { UseEmployeeListResult, EmployeeWithActions } from '../shared/useEmployeeList'
import { DataView, EmptyData, ActionsLayout, useDataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { EmployeeOnboardingStatusBadge } from '@/components/Common/OnboardingStatusBadge'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import { firstLastName } from '@/helpers/formattedStrings'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'

export interface EmployeeListViewProps extends Pick<
  Extract<UseEmployeeListResult, { isLoading: false }>,
  'pagination' | 'status'
> {
  employees: EmployeeWithActions[]
  isFetching: boolean
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
        render: (employee: EmployeeWithActions) => {
          return firstLastName({
            first_name: employee.firstName,
            last_name: employee.lastName,
          })
        },
      },
      {
        key: 'status',
        title: t('statusLabel'),
        render: (employee: EmployeeWithActions) => (
          <EmployeeOnboardingStatusBadge
            onboarded={employee.onboarded}
            onboardingStatus={employee.onboardingStatus}
          />
        ),
      },
    ],
    itemMenu: employee => {
      const menuItems = []

      if (employee.allowedActions.includes('edit')) {
        menuItems.push({
          label: t('editCta'),
          onClick: () => {
            onEdit(employee.uuid, employee.onboardingStatus ?? undefined)
          },
          icon: <PencilSvg aria-hidden />,
        })
      }

      if (employee.allowedActions.includes('cancel_self_onboarding')) {
        menuItems.push({
          label: t('cancelSelfOnboardingCta'),
          onClick: () => {
            void onCancelSelfOnboarding(employee.uuid)
          },
          icon: <PencilSvg aria-hidden />,
        })
      }

      if (employee.allowedActions.includes('review')) {
        menuItems.push({
          label: t('reviewCta'),
          onClick: () => {
            void onReview(employee.uuid)
          },
          icon: <PencilSvg aria-hidden />,
        })
      }

      if (employee.allowedActions.includes('delete')) {
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
          <Components.Button variant="primary" onClick={onAddEmployee} icon={<PlusCircleIcon />}>
            {t('addEmployeeCta')}
          </Components.Button>
        </ActionsLayout>
      </EmptyData>
    ),
  })

  return (
    <>
      <Flex flexDirection="column" gap={24}>
        <Flex justifyContent="space-between" alignItems="center">
          <Components.Heading as="h2">{t('title')}</Components.Heading>

          {employees.length > 0 && (
            <Components.Button
              variant="secondary"
              onClick={onAddEmployee}
              icon={<PlusCircleIcon />}
            >
              {t('addAnotherCta')}
            </Components.Button>
          )}
        </Flex>

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
        onPrimaryActionClick={async () => {
          if (employeeToDelete) {
            try {
              await onDelete(employeeToDelete)
              setEmployeeToDelete(null)
            } catch {
              // Keep dialog open on error
            }
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
