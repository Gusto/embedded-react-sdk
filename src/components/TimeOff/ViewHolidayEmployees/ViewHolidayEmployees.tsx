import { HolidayPolicyDetail } from '../HolidayPolicyDetail'
import type { BaseComponentInterface } from '@/components/Base'

/**
 * Props for {@link ViewHolidayEmployees}.
 *
 * @public
 */
export interface ViewHolidayEmployeesProps extends BaseComponentInterface {
  /** Identifier of the company whose holiday policy enrollment is displayed. */
  companyId: string
}

/**
 * Displays the holiday policy detail view with the employees tab selected.
 *
 * @remarks
 * Shows enrolled employees with search filtering, and provides actions to add employees,
 * edit the holiday selection, or remove employees.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `TIME_OFF_HOLIDAY_ADD_EMPLOYEES` | User clicks to add employees | — |
 * | `TIME_OFF_VIEW_HOLIDAY_SCHEDULE` | User switches to the schedule tab | — |
 * | `TIME_OFF_EDIT_HOLIDAY_POLICY` | User clicks to edit holidays | — |
 * | `TIME_OFF_BACK_TO_LIST` | User navigates back to the policy list | — |
 *
 * @param props - See {@link ViewHolidayEmployeesProps}.
 * @returns The holiday policy detail view rendered with the employees tab active.
 * @public
 */
export function ViewHolidayEmployees(props: ViewHolidayEmployeesProps) {
  return <HolidayPolicyDetail {...props} defaultTab="employees" />
}
