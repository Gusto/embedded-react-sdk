import type { Employee } from '@gusto/embedded-api-v-2025-11-15/models/components/employee'
import type { Job } from '@gusto/embedded-api-v-2025-11-15/models/components/job'
import { useEmployeeEmploymentsGetRehire } from '@gusto/embedded-api-v-2025-11-15/react-query/employeeEmploymentsGetRehire'
import { Skeleton } from '../../../common/Skeleton'
import { DataView, EmptyData, Flex, useDataView } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu/HamburgerMenu'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'

export type EmployeeListTab = 'active' | 'onboarding' | 'dismissed'

export interface EmployeeListProps {
  employees: Employee[]
  isFetching?: boolean
  selectedTab: EmployeeListTab
  onSelectTab: (tab: EmployeeListTab) => void
  successMessage?: string | null
  onDismissSuccess?: () => void
  onAddEmployee?: () => void
  onEditEmployee?: (employee: Employee) => void
  onDismissEmployee?: (employee: Employee) => void
  onRehireEmployee?: (employee: Employee) => void
  onViewEmployeeDetails?: (employee: Employee) => void
  onEditRehire?: (employee: Employee) => void
  onCancelRehire?: (employee: Employee) => void
}

const TABS: Array<{ id: EmployeeListTab; label: string }> = [
  { id: 'active', label: 'Active' },
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'dismissed', label: 'Dismissed' },
]

function getPrimaryJob(employee: Employee): Job | undefined {
  return employee.jobs?.find(job => job.primary === true) ?? employee.jobs?.[0]
}

function formatDate(value?: string | null): string {
  if (!value) return '-'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatShortDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`)
  const now = new Date()
  const sameYear = date.getFullYear() === now.getFullYear()
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  const day = date.getDate()
  return sameYear ? `${month} ${day}` : `${month} ${day}, ${date.getFullYear()}`
}

function pendingDismissalDate(employee: Employee): string | null {
  const pending = employee.terminations?.find(termination => {
    if (!termination.effectiveDate) return false
    if (termination.active === true) return false
    const effective = new Date(`${termination.effectiveDate}T00:00:00`)
    if (Number.isNaN(effective.getTime())) return false
    return effective.getTime() > Date.now()
  })
  return pending?.effectiveDate ?? null
}

function employeeName(employee: Employee): string {
  return [employee.firstName, employee.lastName].filter(Boolean).join(' ') || '-'
}

const ONBOARDING_STATUS_LABELS: Record<string, string> = {
  admin_onboarding_incomplete: 'Admin-onboarding Incomplete',
  onboarding_completed: 'Completed',
  self_onboarding_pending_invite: 'Self-onboarding: Pending Invite',
  self_onboarding_invited: 'Self-onboarding: Invited',
  self_onboarding_invited_started: 'Self-onboarding started',
  self_onboarding_invited_overdue: 'Self-onboarding: Overdue',
  self_onboarding_completed_by_employee: 'Self-onboarding: Completed',
  self_onboarding_awaiting_admin_review: 'Self-onboarding: Admin review',
}

function usePendingRehireEffectiveDate(employeeId: string): string | null {
  const { data } = useEmployeeEmploymentsGetRehire(
    { employeeId },
    { throwOnError: () => false, retry: false },
  )
  const effectiveDate = data?.rehire?.effectiveDate
  if (!effectiveDate) return null
  const effective = new Date(`${effectiveDate}T00:00:00`)
  if (Number.isNaN(effective.getTime()) || effective.getTime() <= Date.now()) return null
  return effectiveDate
}

function PendingRehireBadge({ employeeId }: { employeeId: string }) {
  const Components = useComponentContext()
  const effectiveDate = usePendingRehireEffectiveDate(employeeId)
  if (!effectiveDate) return null
  return <Components.Badge status="info">Rehire {formatShortDate(effectiveDate)}</Components.Badge>
}

function DismissedRowMenu({
  employee,
  onViewDetails,
  onRehire,
  onEditRehire,
  onCancelRehire,
}: {
  employee: Employee
  onViewDetails?: (employee: Employee) => void
  onRehire?: (employee: Employee) => void
  onEditRehire?: (employee: Employee) => void
  onCancelRehire?: (employee: Employee) => void
}) {
  const hasPendingRehire = usePendingRehireEffectiveDate(employee.uuid) !== null

  const items: Array<{ label: string; onClick: () => void; icon?: React.ReactNode }> = []

  if (onViewDetails) {
    items.push({
      label: 'View details',
      onClick: () => {
        onViewDetails(employee)
      },
    })
  }

  if (hasPendingRehire) {
    if (onEditRehire) {
      items.push({
        label: 'Edit rehire details',
        onClick: () => {
          onEditRehire(employee)
        },
        icon: <PencilSvg aria-hidden />,
      })
    }
    if (onCancelRehire) {
      items.push({
        label: 'Cancel rehire',
        onClick: () => {
          onCancelRehire(employee)
        },
        icon: <TrashCanSvg aria-hidden />,
      })
    }
  } else if (onRehire) {
    items.push({
      label: 'Rehire',
      onClick: () => {
        onRehire(employee)
      },
    })
  }

  if (items.length === 0) return null
  return <HamburgerMenu items={items} triggerLabel="Open actions" />
}

function onboardingStatusLabel(employee: Employee): string {
  if (employee.onboarded) return 'Onboarded'
  if (!employee.onboardingStatus) return 'N/A'
  return ONBOARDING_STATUS_LABELS[employee.onboardingStatus] ?? employee.onboardingStatus
}

export function EmployeeList({
  employees,
  isFetching,
  selectedTab,
  onSelectTab,
  onAddEmployee,
  onEditEmployee,
  onDismissEmployee,
  onRehireEmployee,
  onViewEmployeeDetails,
  onEditRehire,
  onCancelRehire,
  successMessage,
  onDismissSuccess,
}: EmployeeListProps) {
  const Components = useComponentContext()

  const nameColumn = {
    key: 'name',
    title: 'Name',
    render: (employee: Employee) => employeeName(employee),
  }

  const jobTitleColumn = {
    key: 'jobTitle',
    title: 'Job title',
    render: (employee: Employee) => getPrimaryJob(employee)?.title ?? '-',
  }

  const startDateColumn = {
    key: 'startDate',
    title: 'Start date',
    render: (employee: Employee) => formatDate(getPrimaryJob(employee)?.hireDate),
  }

  const statusColumn = {
    key: 'status',
    title: 'Status',
    render: (employee: Employee) => (
      <Components.Badge status={employee.onboarded ? 'success' : 'warning'}>
        {onboardingStatusLabel(employee)}
      </Components.Badge>
    ),
  }

  const lastDayColumn = {
    key: 'lastDay',
    title: 'Last day',
    render: (employee: Employee) => formatDate(employee.terminations?.[0]?.effectiveDate),
  }

  const pendingRehireColumn = {
    key: 'pendingRehire',
    title: '',
    render: (employee: Employee) => <PendingRehireBadge employeeId={employee.uuid} />,
  }

  const pendingDismissalColumn = {
    key: 'pendingDismissal',
    title: '',
    render: (employee: Employee) => {
      const date = pendingDismissalDate(employee)
      if (!date) return null
      return <Components.Badge status="info">Last day {formatShortDate(date)}</Components.Badge>
    },
  }

  const realColumns = (() => {
    switch (selectedTab) {
      case 'active':
        return [nameColumn, jobTitleColumn, pendingDismissalColumn]
      case 'onboarding':
        return [nameColumn, startDateColumn, jobTitleColumn, statusColumn]
      case 'dismissed':
        return [nameColumn, jobTitleColumn, lastDayColumn, pendingRehireColumn]
    }
  })()

  const skeletonColumns = realColumns.map(col => ({
    key: col.key,
    title: col.title ? <Skeleton width={60} height={16} /> : '',
    render: () => <Skeleton width={120} height={16} />,
  }))

  const placeholders = Array.from({ length: 3 }) as Employee[]
  const columns = isFetching ? skeletonColumns : realColumns
  const data = isFetching ? placeholders : employees

  const emptyState = (() => {
    switch (selectedTab) {
      case 'active':
        return {
          title: 'No active employees',
          description: 'Once an employee finishes onboarding, they will appear here.',
        }
      case 'onboarding':
        return {
          title: 'No employees in onboarding',
          description: 'Add an employee to start their onboarding.',
        }
      case 'dismissed':
        return {
          title: 'No dismissed employees',
          description: 'Dismissed employees appear here and can be rehired.',
        }
    }
  })()

  const dataViewProps = useDataView<Employee>({
    data,
    columns,
    isFetching,
    itemMenu: isFetching
      ? undefined
      : employee => {
          if (selectedTab === 'dismissed') {
            return (
              <DismissedRowMenu
                employee={employee}
                onViewDetails={onViewEmployeeDetails}
                onRehire={onRehireEmployee}
                onEditRehire={onEditRehire}
                onCancelRehire={onCancelRehire}
              />
            )
          }

          const items: Array<{ label: string; onClick: () => void; icon?: React.ReactNode }> = []

          if (onEditEmployee) {
            items.push({
              label: 'Edit',
              onClick: () => {
                onEditEmployee(employee)
              },
              icon: <PencilSvg aria-hidden />,
            })
          }

          if (selectedTab === 'active' && onDismissEmployee) {
            items.push({
              label: 'Dismiss',
              onClick: () => {
                onDismissEmployee(employee)
              },
              icon: <TrashCanSvg aria-hidden />,
            })
          }

          if (items.length === 0) return null
          return <HamburgerMenu items={items} triggerLabel="Open actions" />
        },
    emptyState: () => <EmptyData title={emptyState.title} description={emptyState.description} />,
  })

  return (
    <Flex flexDirection="column" gap={32}>
      {successMessage && (
        <Components.Alert
          label={successMessage}
          status="success"
          onDismiss={onDismissSuccess}
          disableScrollIntoView
        />
      )}

      <Flex justifyContent="space-between" alignItems="center">
        <Components.Heading as="h2">Employees</Components.Heading>
        {onAddEmployee && (
          <Components.Button variant="secondary" onClick={onAddEmployee} icon={<PlusCircleIcon />}>
            Add employee
          </Components.Button>
        )}
      </Flex>

      <Flex flexDirection="column" gap={0}>
        <Components.Tabs
          tabs={TABS.map(tab => ({ id: tab.id, label: tab.label, content: null }))}
          selectedId={selectedTab}
          onSelectionChange={id => {
            onSelectTab(id as EmployeeListTab)
          }}
          aria-label="Employee filter"
        />

        <DataView label="Employees" {...dataViewProps} />
      </Flex>
    </Flex>
  )
}
