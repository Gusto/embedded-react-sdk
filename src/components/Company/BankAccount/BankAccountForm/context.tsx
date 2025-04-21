import { createCompoundContext } from '@/components/Base'

type BankAccountFormContextType = {
  isPending: boolean
}

const [useBankAccountForm, BankAccountFormProvider] =
  createCompoundContext<BankAccountFormContextType>('BankAccountContext')

export { useBankAccountForm, BankAccountFormProvider }
