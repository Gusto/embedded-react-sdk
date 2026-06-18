import { BankFormBody } from '../shared/BankFormBody'
import type { UseBankFormProps } from '../shared/useBankForm'
import { useManagementBankFormDictionary } from './useFormDictionary'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

/**
 * Props for {@link PaymentMethodBankForm}.
 *
 * @public
 */
export interface PaymentMethodBankFormProps extends Omit<UseBankFormProps, 'employeeId'> {
  /** The associated employee identifier. */
  employeeId: string
  /** Event handler fired on bank-form lifecycle events. */
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Standalone bank-account form for the management flow.
 *
 * @remarks
 * Renders the shared bank-account form and emits per-component scoped events
 * when the form is submitted or cancelled. Reads its copy from the dedicated
 * `Employee.Management.PaymentMethodBankForm` namespace so partner overrides on
 * the management bank form don't leak into the onboarding form.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/management/paymentMethod/bankForm/submitted` | Fired after the bank account is successfully created | The created bank account |
 * | `employee/management/paymentMethod/bankForm/cancelled` | Fired when the user cancels the form | — |
 *
 * @param props - See {@link PaymentMethodBankFormProps}.
 * @returns The bank-account form.
 * @public
 */
export function PaymentMethodBankForm({
  employeeId,
  onEvent,
  ...hookProps
}: PaymentMethodBankFormProps) {
  const dictionary = useManagementBankFormDictionary()

  return (
    <BankFormBody
      employeeId={employeeId}
      dictionary={dictionary}
      onSaved={data => {
        onEvent(componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_SUBMITTED, data)
      }}
      onCancel={() => {
        onEvent(componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_CANCELLED)
      }}
      {...hookProps}
    />
  )
}
