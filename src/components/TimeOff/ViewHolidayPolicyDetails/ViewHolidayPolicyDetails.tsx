import { HolidayPolicyDetail } from '../HolidayPolicyDetail'
import type { BaseComponentInterface } from '@/components/Base'

/**
 * Props for the {@link ViewHolidayPolicyDetails} component.
 *
 * @public
 */
export interface ViewHolidayPolicyDetailsProps extends BaseComponentInterface {
  /** The associated company identifier. */
  companyId: string
  /** Which tab to display initially. Defaults to `'holidays'`. */
  defaultTab?: 'holidays' | 'employees'
}

/**
 * Displays the holiday pay policy for a company with tabbed views of the included holidays and
 * the enrolled employees.
 *
 * @remarks
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `timeOff/backToList` | The user clicked the back navigation. | — |
 * | `timeOff/holidayAddEmployees` | The user clicked the add-employees action. | — |
 * | `timeOff/editHolidayPolicy` | The user clicked the edit-policy action. | — |
 *
 * @param props - {@link ViewHolidayPolicyDetailsProps}
 * @returns The rendered holiday policy detail view.
 * @public
 */
export function ViewHolidayPolicyDetails(props: ViewHolidayPolicyDetailsProps) {
  return <HolidayPolicyDetail {...props} />
}
