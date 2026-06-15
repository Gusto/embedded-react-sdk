import { createMachine } from 'robot3'
import { useMemo } from 'react'
import type { OnboardingContextInterface } from '../../OnboardingFlow/OnboardingFlowComponents'
import type { PaymentMethodContextInterface } from './PaymentMethodComponents'
import { ListViewContextual } from './PaymentMethodComponents'
import { paymentMethodStateMachine } from './paymentMethodStateMachine'
import { Flow } from '@/components/Flow/Flow'
import { useFlow } from '@/components/Flow/useFlow'
import {
  BaseBoundaries,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { type EventType } from '@/shared/constants'
import { useComponentDictionary } from '@/i18n/I18n'
import { useI18n } from '@/i18n'
import { ensureRequired } from '@/helpers/ensureRequired'
import type { OnEventType } from '@/components/Base/useBase'

/**
 * Props for {@link PaymentMethod}.
 *
 * @public
 */
export interface PaymentMethodProps extends CommonComponentInterface<'Employee.PaymentMethod'> {
  /** The associated employee identifier. */
  employeeId: string
  /** Not used — onboarding payment method editing operates on live data. */
  defaultValues?: never
  /** Whether the current viewer is an admin. Defaults to `false`. */
  isAdmin?: boolean
  /** Event handler fired on flow state changes. */
  onEvent: OnEventType<EventType, unknown>
}

function PaymentMethodFlow({ employeeId, isAdmin = false, onEvent }: PaymentMethodProps) {
  useI18n('Employee.PaymentMethod')

  const machine = useMemo(
    () =>
      createMachine(
        'list',
        paymentMethodStateMachine,
        (initialContext: PaymentMethodContextInterface) => ({
          ...initialContext,
          component: ListViewContextual,
          employeeId,
          isAdmin,
        }),
      ),
    [employeeId, isAdmin],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}

/**
 * Onboarding step for setting up an employee's payment method.
 *
 * @remarks
 * Lets the employee (or admin acting on their behalf) choose between Direct
 * Deposit and Check, add bank accounts, and configure split-paycheck
 * allocations across multiple accounts.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/paymentMethod/updated` | Fired after the payment method is saved | The updated payment method |
 * | `employee/paymentMethod/done` | Fired when payment method setup is complete and the parent flow can advance | — |
 * | `employee/bankAccount/created` | Fired after a bank account is successfully added | The created bank account |
 * | `employee/bankAccount/deleted` | Fired after a bank account is successfully removed | — |
 *
 * @param props - See {@link PaymentMethodProps}.
 * @returns The payment method onboarding step.
 * @public
 *
 * @example
 * ```tsx
 * import { EmployeeOnboarding } from '@gusto/embedded-react-sdk'
 *
 * function MyComponent() {
 *   return (
 *     <EmployeeOnboarding.PaymentMethod
 *       employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function PaymentMethod({
  dictionary,
  FallbackComponent,
  ...props
}: PaymentMethodProps & BaseComponentInterface) {
  useComponentDictionary('Employee.PaymentMethod', dictionary)
  return (
    <BaseBoundaries componentName="Employee.PaymentMethod" FallbackComponent={FallbackComponent}>
      <PaymentMethodFlow {...props} />
    </BaseBoundaries>
  )
}

/** @internal */
export function PaymentMethodContextual() {
  const { employeeId, onEvent, isAdmin } = useFlow<OnboardingContextInterface>()
  return (
    <PaymentMethod employeeId={ensureRequired(employeeId)} onEvent={onEvent} isAdmin={isAdmin} />
  )
}
