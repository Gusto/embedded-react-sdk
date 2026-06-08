import { SplitPaymentsFormBody } from '../shared/SplitPaymentsFormBody'
import type { UseSplitPaymentsFormProps } from '../shared/useSplitPaymentsForm'
import { useManagementSplitFormDictionary } from './useFormDictionary'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

export interface PaymentMethodSplitFormProps extends Omit<UseSplitPaymentsFormProps, 'employeeId'> {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Standalone split-paycheck form for the management flow. Renders the shared
 * {@link SplitPaymentsFormBody} and emits the per-component scoped events
 * `EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_SPLIT_FORM_SUBMITTED` and
 * `EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_SPLIT_FORM_CANCELLED`. Reads its copy from
 * the dedicated `Employee.Management.PaymentMethodSplitForm` namespace so partner
 * overrides on the management split form don't leak into the onboarding form.
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
