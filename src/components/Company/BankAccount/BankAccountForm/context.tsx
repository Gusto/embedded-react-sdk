import type { CompanyBankAccount } from '@gusto/embedded-api/models/components/companybankaccount'
import { createCompoundContext } from '@/components/Base'

type BankAccountFormContextType = {
  bankAccount: CompanyBankAccount | null
  isPending: boolean
}

const [useBankAccountForm, BankAccountFormProvider] =
  createCompoundContext<BankAccountFormContextType>('BankAccountContext')

export { useBankAccountForm, BankAccountFormProvider }
