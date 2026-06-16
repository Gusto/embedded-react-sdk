import { HolidayPolicyDetail } from '../HolidayPolicyDetail'
import type { BaseComponentInterface } from '@/components/Base'

/**
 * Props for {@link ViewHolidaySchedule}.
 *
 * @public
 */
export interface ViewHolidayScheduleProps extends BaseComponentInterface {
  /** The associated company identifier. */
  companyId: string
}

/**
 * Displays the holiday policy detail view with the holidays tab selected.
 *
 * Shows the list of selected holidays with their next observation dates.
 *
 * @remarks
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `TIME_OFF_VIEW_HOLIDAY_EMPLOYEES` | Fired when user switches to the employees tab | — |
 * | `TIME_OFF_HOLIDAY_ADD_EMPLOYEES` | Fired when user clicks to add employees | — |
 * | `TIME_OFF_EDIT_HOLIDAY_POLICY` | Fired when user clicks to edit holidays | — |
 * | `TIME_OFF_BACK_TO_LIST` | Fired when user navigates back to policy list | — |
 *
 * @param props - See {@link ViewHolidayScheduleProps}.
 * @returns The holiday schedule view.
 * @public
 */
export function ViewHolidaySchedule(props: ViewHolidayScheduleProps) {
  return <HolidayPolicyDetail {...props} defaultTab="holidays" />
}
