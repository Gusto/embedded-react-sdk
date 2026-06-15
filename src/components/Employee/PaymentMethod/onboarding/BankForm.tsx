import { BankFormBody } from '../shared/BankFormBody'
import type { UseBankFormProps } from '../shared/useBankForm'
import { useOnboardingBankFormDictionary } from './useFormDictionary'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

/** @internal */
export interface BankFormProps extends Omit<UseBankFormProps, 'employeeId'> {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

/** @internal */
export function BankForm({ employeeId, onEvent, ...hookProps }: BankFormProps) {
  const dictionary = useOnboardingBankFormDictionary()

  return (
    <BankFormBody
      employeeId={employeeId}
      dictionary={dictionary}
      onSaved={data => {
        onEvent(componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATED, data)
      }}
      onCancel={() => {
        onEvent(componentEvents.CANCEL)
      }}
      {...hookProps}
    />
  )
}
