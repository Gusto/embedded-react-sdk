import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { EmployeeTab, UseManagementEmployeeListResult } from './useManagementEmployeeList'
import { DataView, EmptyData, useDataView } from '@/components/Common'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { EmployeeOnboardingStatusBadge } from '@/components/Common/OnboardingStatusBadge'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import { firstLastName } from '@/helpers/formattedStrings'
import { formatDateLongWithYear } from '@/helpers/dateFormatting'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'

export interface ManagementEmployeeListViewProps extends UseManagementEmployeeListResult {
  onEdit: (employeeId: string) => void
  onDelete: (employeeId: string) => Promise<void>
  onRehire: (employeeId: string) => void
  onAddEmployee: () => void
  isDeleting: boolean
}

export function ManagementEmployeeListView({
  selectedTab,
  onTabChange,
  employees,
  isFetching,
  onEdit,
  onDelete,
  onRehire,
  onAddEmployee,
  isDeleting,
  pagination,
}: ManagementEmployeeListViewProps) {
  const { t } = useTranslation('Employee.ManagementEmployeeList')
  const Components = useComponentContext()
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null)

  const {
    handleNextPage,
    handleFirstPage,
    handleLastPage,
    handlePreviousPage,
    handleItemsPerPageChange,
    currentPage,
    totalPages,
    totalCount,
    itemsPerPage,
  } = pagination

  const tabs = [
    {
      id: 'active',
      label: t('tabs.active'),
      content: null,
    },
    {
      id: 'onboarding',
      label: t('tabs.onboarding'),
      content: null,
    },
    {
      id: 'dismissed',
      label: t('tabs.dismissed'),
      content: null,
    },
  ]

  const getColumns = () => {
    const nameColumn = {
      key: 'name',
      title: t('nameLabel'),
      render: (employee: Employee) => {
        return firstLastName({
          first_name: employee.firstName,
          last_name: employee.lastName,
        })
      },
    }

    const jobTitleColumn = {
      key: 'jobTitle',
      title: t('jobTitleLabel'),
      render: (employee: Employee) => {
        const primaryJob = employee.jobs?.find(job => job.primary === true)
        return primaryJob?.title ?? '-'
      },
    }

    if (selectedTab === 'active') {
      return [nameColumn, jobTitleColumn]
    }

    if (selectedTab === 'onboarding') {
      return [
        nameColumn,
        {
          key: 'startDate',
          title: t('startDateLabel'),
          render: (employee: Employee) => {
            const primaryJob = employee.jobs?.find(job => job.primary === true)
            const formattedDate = formatDateLongWithYear(primaryJob?.hireDate)
            return formattedDate || '-'
          },
        },
        jobTitleColumn,
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
      ]
    }

    return [
      nameColumn,
      jobTitleColumn,
      {
        key: 'lastDay',
        title: t('lastDayLabel'),
        render: (employee: Employee) => {
          const termination = employee.terminations?.[0]
          const formattedDate = formatDateLongWithYear(termination?.effectiveDate)
          return formattedDate || '-'
        },
      },
    ]
  }

  const { ...dataViewProps } = useDataView({
    data: employees,
    columns: getColumns(),
    itemMenu: employee => {
      const menuItems = []

      if (selectedTab === 'active') {
        menuItems.push({
          label: t('editCta'),
          onClick: () => {
            onEdit(employee.uuid)
          },
          icon: <PencilSvg aria-hidden />,
        })
      }

      if (selectedTab === 'onboarding') {
        menuItems.push({
          label: t('cancelCta'),
          onClick: () => {
            setEmployeeToDelete(employee.uuid)
          },
          icon: <PencilSvg aria-hidden />,
        })
      }

      if (selectedTab === 'dismissed') {
        menuItems.push({
          label: t('rehireCta'),
          onClick: () => {
            onRehire(employee.uuid)
          },
          icon: <PencilSvg aria-hidden />,
        })
      }

      return <HamburgerMenu items={menuItems} triggerLabel={t('hamburgerTitle')} />
    },
    isFetching,
    pagination: {
      handleNextPage,
      handleFirstPage,
      handleLastPage,
      handlePreviousPage,
      handleItemsPerPageChange,
      currentPage,
      totalPages,
      totalCount,
      itemsPerPage,
    },
    emptyState: () => {
      let title = ''

      if (selectedTab === 'active') {
        title = t('emptyState.active.title')
      } else if (selectedTab === 'onboarding') {
        title = t('emptyState.onboarding.title')
      } else {
        title = t('emptyState.dismissed.title')
      }

      return <EmptyData title={title} />
    },
  })

  return (
    <>
      <Flex flexDirection="column" gap={32}>
        <Flex justifyContent="space-between" alignItems="center">
          <Components.Heading as="h2">{t('title')}</Components.Heading>
          <Components.Button variant="secondary" onClick={onAddEmployee} icon={<PlusCircleIcon />}>
            {t('addEmployeeCta')}
          </Components.Button>
        </Flex>

        <Components.Tabs
          tabs={tabs}
          selectedId={selectedTab}
          onSelectionChange={id => {
            onTabChange(id as EmployeeTab)
          }}
          aria-label={t('tabsLabel')}
        />

        <DataView label={t('employeeListLabel')} {...dataViewProps} />
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
        isPrimaryActionLoading={isDeleting}
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
