import type { CompanyBankAccount } from '@gusto/embedded-api/models/components/companybankaccount'
import { createCompoundContext } from '@/components/Base/Base'
type BankAccountVerifyContextType = {
  bankAccount: CompanyBankAccount
  isPending: boolean
  handleCancel: () => void
}

const [useBankAccountVerify, BankAccountVerifyProvider] =
  createCompoundContext<BankAccountVerifyContextType>('BankAccountVerifyContext')

export { useBankAccountVerify, BankAccountVerifyProvider }
