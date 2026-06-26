import { HolidayPolicyDetail } from '../HolidayPolicyDetail'
import type { BaseComponentInterface } from '@/components/Base'

/**
 * Props for {@link ViewHolidaySchedule}.
 *
 * @public
 */
export interface ViewHolidayScheduleProps extends BaseComponentInterface<
  'Company.TimeOff.HolidayPolicy' | 'Company.TimeOff.PolicyDetail'
> {
  /** The associated company identifier. */
  companyId: string
}

/**
 * Displays the holiday policy detail view with the holidays tab selected.
 *
 * Shows the list of selected holidays with their next observation dates.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `timeOff/holidayAddEmployees` | Fired when user clicks to add employees | — |
 * | `timeOff/editHolidayPolicy` | Fired when user clicks to edit holidays | — |
 * | `timeOff/backToList` | Fired when user navigates back to policy list | — |
 *
 * @param props - See {@link ViewHolidayScheduleProps}.
 * @returns The holiday schedule view.
 * @public
 */
export function ViewHolidaySchedule(props: ViewHolidayScheduleProps) {
  return <HolidayPolicyDetail {...props} defaultTab="holidays" />
}
