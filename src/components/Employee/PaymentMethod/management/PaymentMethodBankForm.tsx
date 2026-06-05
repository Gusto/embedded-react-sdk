import { BankFormBody } from '../shared/BankFormBody'
import type { UseBankFormProps } from '../shared/useBankForm'
import { useManagementBankFormDictionary } from './useFormDictionary'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

export interface PaymentMethodBankFormProps extends Omit<UseBankFormProps, 'employeeId'> {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Standalone bank-account form for the management flow. Renders the shared
 * {@link BankFormBody} and emits the per-component scoped events
 * `EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_SUBMITTED` and
 * `EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_CANCELLED`. Reads its copy from
 * the dedicated `Employee.Management.PaymentMethodBankForm` namespace so partner
 * overrides on the management bank form don't leak into the onboarding form.
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
