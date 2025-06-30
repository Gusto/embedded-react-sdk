import { createCompoundContext } from '@/components/Base'
import { type OnEventType } from '@/components/Base/useBase'
import { type EventType } from '@/shared/constants'

type BankAccountFormContextType = {
  isPending: boolean
  isEditing: boolean
  onEvent: OnEventType<EventType, unknown>
}

const [useBankAccountForm, BankAccountFormProvider] =
  createCompoundContext<BankAccountFormContextType>('BankAccountContext')

export { useBankAccountForm, BankAccountFormProvider }
