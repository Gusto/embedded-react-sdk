import { createMachine } from 'robot3'
import { useMemo } from 'react'
import type { PaymentMethodContextInterface } from './PaymentMethodComponents'
import {
  PaymentMethodCardContextual,
  PaymentMethodBankFormContextual,
  PaymentMethodSplitFormContextual,
} from './PaymentMethodComponents'
import { paymentMethodStateMachine } from './paymentMethodStateMachine'
import { Flow } from '@/components/Flow/Flow'
import { BaseBoundaries, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'
import { useI18n } from '@/i18n'

/**
 * Props for {@link PaymentMethod}.
 *
 * @public
 */
export interface PaymentMethodProps extends BaseComponentInterface<'Employee.Management.PaymentMethod'> {
  /** The associated employee identifier. */
  employeeId: string
  /** Not used — payment method management edits live data. */
  defaultValues?: never
  /** Whether the current viewer is an admin. Defaults to `true`. */
  isAdmin?: boolean
  /** Step to render first: the list card, the add-account form, or the split-paycheck form. Defaults to `'list'`. */
  initialState?: 'list' | 'add' | 'split'
}

function PaymentMethodFlow({
  employeeId,
  isAdmin = true,
  initialState = 'list',
  onEvent,
}: PaymentMethodProps) {
  useI18n('Employee.Management.PaymentMethod')

  const initialComponent =
    initialState === 'add'
      ? PaymentMethodBankFormContextual
      : initialState === 'split'
        ? PaymentMethodSplitFormContextual
        : PaymentMethodCardContextual

  const machine = useMemo(
    () =>
      createMachine(
        initialState,
        paymentMethodStateMachine,
        (ctx: PaymentMethodContextInterface) => ({
          ...ctx,
          component: initialComponent,
          employeeId,
          isAdmin,
          successAlert: null,
        }),
      ),
    [employeeId, isAdmin, initialState, initialComponent],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}

/**
 * Management flow for editing an employee's payment method.
 *
 * @remarks
 * Orchestrates the list card, add-bank-account form, and split-paycheck form
 * for an existing employee. Routes between steps based on user actions
 * starting from `initialState`. Composed of the smaller standalone components
 * ({@link PaymentMethodCard}, {@link PaymentMethodBankForm},
 * {@link PaymentMethodSplitForm}) which can also be used directly when an
 * orchestrator other than this flow is needed.
 *
 * @param props - See {@link PaymentMethodProps}.
 * @returns The payment method management flow.
 * @public
 *
 * @example
 * ```tsx
 * import { EmployeeManagement } from '@gusto/embedded-react-sdk'
 *
 * function MyComponent() {
 *   return (
 *     <EmployeeManagement.PaymentMethod
 *       employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function PaymentMethod({ dictionary, FallbackComponent, ...props }: PaymentMethodProps) {
  useComponentDictionary('Employee.Management.PaymentMethod', dictionary)
  return (
    <BaseBoundaries
      componentName="Employee.Management.PaymentMethod"
      FallbackComponent={FallbackComponent}
    >
      <PaymentMethodFlow {...props} />
    </BaseBoundaries>
  )
}
