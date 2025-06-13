import { createMachine } from 'robot3'
import { useBankAccountsGetSuspense } from '@gusto/embedded-api/react-query/bankAccountsGet'
import {
  BankAccountFormContextual,
  type BankAccountContextInterface,
} from './BankAccountComponents'
import { bankAccountStateMachine } from './stateMachine'
import { BankAccountListContextual } from './BankAccountComponents'
import { BankAccountList } from './BankAccountList/BankAccountList'
import { BankAccountForm } from './BankAccountForm/BankAccountForm'
import { BankAccountVerify } from './BankAccountVerify/BankAccountVerify'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'

export interface LocationsProps extends BaseComponentInterface<'Company.BankAccount'> {
  companyId: string
}

export function BankAccount({ companyId, onEvent, dictionary }: LocationsProps) {
  useComponentDictionary('Company.BankAccount', dictionary)
  const { data } = useBankAccountsGetSuspense({ companyId })
  const companyBankAccountList = data.companyBankAccountList!
  //Currently, we only support a single default bank account per company.
  const bankAccount = companyBankAccountList.length > 0 ? companyBankAccountList[0]! : null

  const manageLocations = createMachine(
    bankAccount ? 'viewBankAccount' : 'addBankAccount',
    bankAccountStateMachine,
    (initialContext: BankAccountContextInterface) => ({
      ...initialContext,
      component: bankAccount ? BankAccountListContextual : BankAccountFormContextual,
      companyId,
      bankAccount,
      showVerifiedMessage: false,
    }),
  )
  return <Flow machine={manageLocations} onEvent={onEvent} />
}

BankAccount.BankAccountList = BankAccountList
BankAccount.BankAccountForm = BankAccountForm
BankAccount.BankAccountVerify = BankAccountVerify
