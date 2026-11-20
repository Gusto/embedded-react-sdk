import { useState, useMemo } from 'react'
import { useEmployeeList, type EmployeeType } from '../shared/useEmployeeList'
import { ManagementEmployeeListView } from './ManagementEmployeeListView'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base/Base'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents, EmployeeOnboardingStatus } from '@/shared/constants'

/**
 * The tab currently selected on {@link ManagementEmployeeList | EmployeeList}.
 *
 * @public
 */
export type EmployeeTab = 'active' | 'onboarding' | 'dismissed'

/**
 * Props for {@link ManagementEmployeeList}.
 *
 * @public
 */
export interface ManagementEmployeeListProps extends BaseComponentInterface<'Employee.ManagementEmployeeList'> {
  /** The associated company identifier. */
  companyId: string
  /** Tab to render first: Active, Onboarding, or Dismissed. Defaults to `'active'`. */
  initialTab?: EmployeeTab
}

const mapTabToEmployeeType = (tab: EmployeeTab): EmployeeType => {
  switch (tab) {
    case 'active':
      return 'active'
    case 'onboarding':
      return 'onboarding'
    case 'dismissed':
      return 'terminated'
  }
}

function ManagementEmployeeListRoot({
  companyId,
  initialTab = 'active',
  onEvent,
  dictionary,
  LoaderComponent,
  className,
}: ManagementEmployeeListProps) {
  useI18n('Employee.ManagementEmployeeList')
  useComponentDictionary('Employee.ManagementEmployeeList', dictionary)

  const [selectedTab, setSelectedTab] = useState<EmployeeTab>(initialTab)

  const employeeType = useMemo(() => mapTabToEmployeeType(selectedTab), [selectedTab])

  const employeeList = useEmployeeList({
    companyId,
    employeeType,
  })

  if (employeeList.isLoading) {
    return (
      <BaseLayout
        isLoading
        error={employeeList.errorHandling.errors}
        LoaderComponent={LoaderComponent}
      />
    )
  }

  const handleEdit = (employeeId: string) => {
    onEvent(componentEvents.EMPLOYEE_UPDATE, { employeeId })
  }

  const handleAddEmployee = () => {
    onEvent(componentEvents.EMPLOYEE_CREATE)
  }

  const handleDismiss = (employeeId: string) => {
    onEvent(componentEvents.EMPLOYEE_DISMISS, { employeeId })
  }

  const handleReview = async (employeeId: string) => {
    const employee = employeeList.data.employees.find(({ uuid }) => uuid === employeeId)
    if (
      employee?.onboardingStatus === EmployeeOnboardingStatus.SELF_ONBOARDING_AWAITING_ADMIN_REVIEW
    ) {
      onEvent(componentEvents.EMPLOYEE_MANAGEMENT_REVIEW, {
        employeeId,
        onboardingStatus: employee.onboardingStatus,
      })
      return
    }

    const onboardingStatus = await employeeList.actions.onReview(employeeId)
    if (!onboardingStatus) return
    onEvent(componentEvents.EMPLOYEE_ONBOARDING_STATUS_UPDATED, onboardingStatus)
    onEvent(componentEvents.EMPLOYEE_MANAGEMENT_REVIEW, {
      employeeId,
      onboardingStatus: onboardingStatus.onboardingStatus,
    })
  }

  const handleTabChange = (tab: EmployeeTab) => {
    setSelectedTab(tab)
  }

  return (
    <BaseLayout error={employeeList.errorHandling.errors} LoaderComponent={LoaderComponent}>
      <ManagementEmployeeListView
        selectedTab={selectedTab}
        onTabChange={handleTabChange}
        employees={employeeList.data.employees}
        isFetching={employeeList.status.isFetching}
        pagination={employeeList.pagination}
        status={employeeList.status}
        onEdit={handleEdit}
        onDismiss={handleDismiss}
        onReview={handleReview}
        onDelete={async (employeeId: string) => {
          await employeeList.actions.onDelete(employeeId)
          onEvent(componentEvents.EMPLOYEE_DELETED, { employeeId })
        }}
        onAddEmployee={handleAddEmployee}
        className={className}
      />
    </BaseLayout>
  )
}

/**
 * Renders a tabbed list of a company's employees split across Active, Onboarding, and Dismissed
 * tabs, with per-row actions tailored to each tab (edit, delete, dismiss, review).
 * Dismissed rows have no available actions, so no menu is rendered for them.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/create` | Fired when the user clicks "Add employee". | — |
 * | `employee/update` | Fired when the user selects "Edit" on a row. | `{ employeeId: string }` |
 * | `employee/dismiss` | Fired when the user selects "Dismiss" on a row in the Active tab. | `{ employeeId: string }` |
 * | `employee/deleted` | Fired after a row's delete action completes. | `{ employeeId: string }` |
 * | `employee/onboardingStatus/updated` | Fired after "Review employee" moves an employee who finished self-onboarding into admin review. | The updated `EmployeeOnboardingStatus` record |
 * | `employee/management/review` | Fired when the user selects "Review employee" on a row in the Onboarding tab, after `employee/onboardingStatus/updated` when the status changed. Employees already in admin review skip the status update. | `{ employeeId: string, onboardingStatus: OnboardingStatus }` |
 *
 * @public
 */
export function ManagementEmployeeList({
  FallbackComponent,
  LoaderComponent,
  ...props
}: ManagementEmployeeListProps) {
  return (
    <BaseBoundaries
      componentName="Employee.ManagementEmployeeList"
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
    >
      <ManagementEmployeeListRoot LoaderComponent={LoaderComponent} {...props} />
    </BaseBoundaries>
  )
}
