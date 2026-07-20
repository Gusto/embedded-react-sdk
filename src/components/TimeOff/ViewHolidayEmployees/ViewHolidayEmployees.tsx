import { HolidayPolicyDetail } from '../HolidayPolicyDetail'
import type { BaseComponentInterface } from '@/components/Base'

/**
 * Props for {@link ViewHolidayEmployees}.
 *
 * @public
 */
export interface ViewHolidayEmployeesProps extends BaseComponentInterface<
  'Company.TimeOff.HolidayPolicy' | 'Company.TimeOff.PolicyDetail'
> {
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
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `timeOff/holidayAddEmployees` | User clicks to add employees | — |
 * | `timeOff/editHolidayPolicy` | User clicks to edit holidays | — |
 * | `timeOff/backToList` | User navigates back to the policy list | — |
 *
 * @param props - See {@link ViewHolidayEmployeesProps}.
 * @returns The holiday policy detail view rendered with the employees tab active.
 * @public
 */
export function ViewHolidayEmployees(props: ViewHolidayEmployeesProps) {
  return <HolidayPolicyDetail {...props} defaultTab="employees" />
}
