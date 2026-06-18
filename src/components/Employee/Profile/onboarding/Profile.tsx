import type { OnboardingContextInterface } from '../../OnboardingFlow/OnboardingFlowComponents'
import { AdminProfile } from './AdminProfile'
import { EmployeeProfile } from './EmployeeProfile'
import {
  BaseBoundaries,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import type { RequireAtLeastOne } from '@/types/Helpers'
import { useFlow } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

/**
 * Pre-fill values for the {@link Profile} onboarding step.
 *
 * @remarks
 * At least one of the listed fields must be provided. When employee data is
 * already available via the API, those values take precedence over the
 * defaults.
 *
 * @public
 */
export type ProfileDefaultValues = RequireAtLeastOne<{
  /** Pre-fill values for the employee details section. At least one nested field must be set. */
  employee?: RequireAtLeastOne<{
    /** The employee's first name. */
    firstName?: string
    /** The employee's middle initial. */
    middleInitial?: string
    /** The employee's last name. */
    lastName?: string
    /** The employee's personal email address. */
    email?: string
    /** The employee's date of birth as an ISO date string (`YYYY-MM-DD`). */
    dateOfBirth?: string
  }>
  /** Pre-fill values for the home address section. At least one nested field must be set. */
  homeAddress?: RequireAtLeastOne<{
    /** First line of the street address. */
    street1?: string
    /** Second line of the street address (optional). */
    street2?: string
    /** City. */
    city?: string
    /** Two-letter state abbreviation. */
    state?: string
    /** ZIP code. */
    zip?: string
  }>
  /** When `true`, the admin form opens with the self-onboarding toggle enabled by default in create mode. */
  inviteEmployeeDefault?: boolean
}>

/**
 * Props for {@link Profile}.
 *
 * @public
 */
export interface ProfileProps extends CommonComponentInterface<'Employee.Profile'> {
  /** The associated employee identifier. Omit to create a new employee. */
  employeeId?: string
  /** The associated company identifier. */
  companyId: string
  /** Pre-fill values for the form fields. */
  defaultValues?: ProfileDefaultValues
  /** When `true`, renders the admin variant (collects work address, start date, and self-onboarding toggle). Defaults to `false`. */
  isAdmin?: boolean
  /** When `true`, the admin variant exposes the self-onboarding toggle. Defaults to `true`. */
  isSelfOnboardingEnabled?: boolean
  /** Event handler fired on profile creation, update, and address changes. */
  onEvent: BaseComponentInterface['onEvent']
}

/**
 * Onboarding step for collecting an employee's basic profile and addresses.
 *
 * @remarks
 * Switches between an admin-facing variant (collects employee details,
 * work address, start date, and an optional self-onboarding invitation
 * toggle) and an employee-facing variant (collects employee details and
 * home address only — the active work address is read-only) based on
 * `isAdmin`. Both variants create the employee on submit when `employeeId`
 * is omitted.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/created` | Fired after an employee is successfully created | {@link Employee} |
 * | `employee/updated` | Fired after an employee is successfully updated | {@link Employee} |
 * | `employee/onboardingStatus/updated` | Fired when toggling self-onboarding changes the employee's onboarding status (admin variant) | The updated onboarding status |
 * | `employee/homeAddress/created` | Fired after the home address is created | {@link EmployeeAddress} |
 * | `employee/homeAddress/updated` | Fired after the home address is updated | {@link EmployeeAddress} |
 * | `employee/workAddress/created` | Fired after the work address is created (admin variant) | {@link EmployeeWorkAddress} |
 * | `employee/workAddress/updated` | Fired after the work address is updated (admin variant) | {@link EmployeeWorkAddress} |
 * | `employee/profile/done` | Fired when all profile saves complete and the parent flow can advance | {@link Employee} extended with `startDate` (admin variant) |
 *
 * @param input - See {@link ProfileProps}.
 * @returns The employee profile onboarding step.
 * @public
 */
export function Profile({
  FallbackComponent,
  isAdmin = false,
  ...props
}: ProfileProps & BaseComponentInterface) {
  return (
    <BaseBoundaries componentName="Employee.Profile" FallbackComponent={FallbackComponent}>
      {isAdmin ? <AdminProfile {...props} isAdmin /> : <EmployeeProfile {...props} />}
    </BaseBoundaries>
  )
}

/** @internal */
export const ProfileContextual = () => {
  const { companyId, employeeId, onEvent, isAdmin, defaultValues, isSelfOnboardingEnabled } =
    useFlow<OnboardingContextInterface>()

  return (
    <Profile
      companyId={ensureRequired(companyId)}
      employeeId={employeeId}
      onEvent={onEvent}
      isAdmin={isAdmin}
      defaultValues={defaultValues?.profile}
      isSelfOnboardingEnabled={isSelfOnboardingEnabled}
    />
  )
}
