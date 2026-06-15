import { SplitPaymentsFormBody } from '../shared/SplitPaymentsFormBody'
import type { UseSplitPaymentsFormProps } from '../shared/useSplitPaymentsForm'
import { useManagementSplitFormDictionary } from './useFormDictionary'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

/**
 * Props for {@link PaymentMethodSplitForm}.
 *
 * @public
 */
export interface PaymentMethodSplitFormProps extends Omit<UseSplitPaymentsFormProps, 'employeeId'> {
  /** The associated employee identifier. */
  employeeId: string
  /** Event handler fired on split-form lifecycle events. */
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Standalone split-paycheck form for the management flow.
 *
 * @remarks
 * Renders the shared split-payments form and emits per-component scoped events
 * when the form is submitted or cancelled. Reads its copy from the dedicated
 * `Employee.Management.PaymentMethodSplitForm` namespace so partner overrides
 * on the management split form don't leak into the onboarding form.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/management/paymentMethod/splitForm/submitted` | Fired after the splits are successfully saved | The updated payment method |
 * | `employee/management/paymentMethod/splitForm/cancelled` | Fired when the user cancels the form | — |
 *
 * @param props - See {@link PaymentMethodSplitFormProps}.
 * @returns The split-paycheck form.
 * @public
 */
export function PaymentMethodSplitForm({
  employeeId,
  onEvent,
  ...hookProps
}: PaymentMethodSplitFormProps) {
  const dictionary = useManagementSplitFormDictionary()

  return (
    <SplitPaymentsFormBody
      employeeId={employeeId}
      dictionary={dictionary}
      onSaved={data => {
        onEvent(componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_SPLIT_FORM_SUBMITTED, data)
      }}
      onCancel={() => {
        onEvent(componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_SPLIT_FORM_CANCELLED)
      }}
      {...hookProps}
    />
  )
}
