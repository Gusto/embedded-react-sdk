import { SelectEmployeesTimeOff } from '../TimeOffManagement/SelectEmployees/SelectEmployeesTimeOff'
import type { CreatableTimeOffPolicyType } from '../TimeOffFlow/timeOffPolicyTypes'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'

/**
 * Props for {@link AddEmployeesToPolicy}.
 *
 * @public
 */
export interface AddEmployeesToPolicyProps extends BaseComponentInterface<never> {
  /** The associated company identifier. */
  companyId: string
  /** The time off policy identifier. */
  policyId: string
  /** The type of policy being edited — `'sick'` or `'vacation'`. */
  policyType: CreatableTimeOffPolicyType
}

/**
 * Employee selection screen for assigning employees to a sick or vacation time off policy.
 *
 * @remarks
 * Displays all active employees with search filtering and pagination. Employees already
 * enrolled in the policy are pre-selected, and carry-over balances are auto-populated
 * from each employee's existing paid time off data. Starting balances can be manually
 * set or overridden per employee. When employees are being moved from another policy a
 * reassignment warning is shown, and removing a previously enrolled employee requires
 * confirmation.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `timeOff/addEmployees/done` | Fired when employee selection is saved | The updated time off policy, or `undefined` when no changes were submitted |
 * | `timeOff/addEmployees/back` | Fired when the user navigates back without saving | — |
 *
 * @param props - See {@link AddEmployeesToPolicyProps}.
 * @returns The employee selection screen for the policy.
 * @public
 *
 * @example
 * ```tsx
 * import { TimeOff } from '@gusto/embedded-react-sdk'
 *
 * function MyComponent() {
 *   return (
 *     <TimeOff.AddEmployeesToPolicy
 *       companyId="your-company-id"
 *       policyId="policy-uuid"
 *       policyType="vacation"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function AddEmployeesToPolicy(props: AddEmployeesToPolicyProps) {
  return (
    <BaseComponent {...props}>
      <SelectEmployeesTimeOff
        companyId={props.companyId}
        policyId={props.policyId}
        policyType={props.policyType}
        mode="standalone"
      />
    </BaseComponent>
  )
}
