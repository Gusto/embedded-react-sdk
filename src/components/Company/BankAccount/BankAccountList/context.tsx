import type { CompanyBankAccount } from '@gusto/embedded-api/models/components/companybankaccount'
import { createCompoundContext } from '@/components/Base/Base'
type BankAccountListContextType = {
  bankAccount: CompanyBankAccount | null
  showVerifiedMessage?: boolean
  handleVerification: () => void
  handleContinue: () => void
  handleChange: () => void
}

const [useBankAccount, BankAccountProvider] =
  createCompoundContext<BankAccountListContextType>('BankAccountContext')

export { useBankAccount, BankAccountProvider }
