import { createCompoundContext } from '@/components/Base/createCompoundContext'
type BankAccountVerifyContextType = {
  isPending: boolean
  handleCancel: () => void
}

const [useBankAccountVerify, BankAccountVerifyProvider] =
  createCompoundContext<BankAccountVerifyContextType>('BankAccountVerifyContext')

export { useBankAccountVerify, BankAccountVerifyProvider }
