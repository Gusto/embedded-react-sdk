import { useState, useMemo } from 'react'
import type { OnboardingStatus } from '@gusto/embedded-api/models/operations/putv1employeesemployeeidonboardingstatus'
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

  const handleContinueOnboarding = (employeeId: string, onboardingStatus?: OnboardingStatus) => {
    onEvent(componentEvents.EMPLOYEE_MANAGEMENT_CONTINUE_ONBOARDING, {
      employeeId,
      onboardingStatus,
    })
  }

  const handleReview = async (employeeId: string) => {
    const onboardingStatus = await employeeList.actions.onReview(employeeId)
    if (!onboardingStatus) return
    onEvent(componentEvents.EMPLOYEE_ONBOARDING_STATUS_UPDATED, onboardingStatus)
    handleContinueOnboarding(
      employeeId,
      EmployeeOnboardingStatus.SELF_ONBOARDING_AWAITING_ADMIN_REVIEW,
    )
  }

  const handleCancelSelfOnboarding = async (employeeId: string) => {
    const onboardingStatus = await employeeList.actions.onCancelSelfOnboarding(employeeId)
    if (!onboardingStatus) return
    onEvent(componentEvents.EMPLOYEE_ONBOARDING_STATUS_UPDATED, onboardingStatus)
  }

  const handleAddEmployee = () => {
    onEvent(componentEvents.EMPLOYEE_CREATE)
  }

  const handleDismiss = (employeeId: string) => {
    onEvent(componentEvents.EMPLOYEE_DISMISS, { employeeId })
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
        onContinueOnboarding={handleContinueOnboarding}
        onReview={handleReview}
        onCancelSelfOnboarding={handleCancelSelfOnboarding}
        onDismiss={handleDismiss}
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
 * tabs, with per-row actions tailored to each tab. Dismissed rows have no available actions, so
 * no menu is rendered for them.
 *
 * @remarks
 * Employees who have finished onboarding offer "Edit employee". Employees still onboarding offer
 * the same actions as {@link EmployeeOnboarding.EmployeeList | the onboarding employee list}:
 * "Continue onboarding" (labeled "Review employee" while the employee is awaiting admin review),
 * "Review employee" once the employee has finished self-onboarding, "Cancel self-onboarding", and
 * "Delete employee". Cancel self-onboarding and delete each ask for confirmation first.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/create` | Fired when the user clicks "Add employee". | — |
 * | `employee/update` | Fired when the user selects "Edit employee" on an employee who has finished onboarding. | `{ employeeId: string }` |
 * | `employee/management/continueOnboarding` | Fired when the user selects "Continue onboarding" or "Review employee" on an employee who hasn't finished onboarding. When a review starts, fired after `employee/onboardingStatus/updated`. | `{ employeeId: string, onboardingStatus?: OnboardingStatus }` |
 * | `employee/onboardingStatus/updated` | Fired after "Review employee" moves an employee into admin review, or after "Cancel self-onboarding" is confirmed. | The updated `EmployeeOnboardingStatus` record |
 * | `employee/dismiss` | Fired when the user selects "Dismiss" on a row in the Active tab. | `{ employeeId: string }` |
 * | `employee/deleted` | Fired after a row's delete action completes. | `{ employeeId: string }` |
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
