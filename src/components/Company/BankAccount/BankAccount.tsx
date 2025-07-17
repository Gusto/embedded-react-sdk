import { createMachine } from 'robot3'
import { useBankAccountsGetSuspense } from '@gusto/embedded-api/react-query/bankAccountsGet'
import {
  BankAccountFormContextual,
  type BankAccountContextInterface,
} from './BankAccountComponents'
import { bankAccountStateMachine } from './stateMachine'
import { BankAccountListContextual } from './BankAccountComponents'
import { Flow } from '@/components/Flow/Flow'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'

export interface BankAccountProps extends BaseComponentInterface<'Company.BankAccount'> {
  companyId: string
}

function BankAccountFlow({ companyId, onEvent, dictionary }: BankAccountProps) {
  useComponentDictionary('Company.BankAccount', dictionary)
  const { data } = useBankAccountsGetSuspense({ companyId })
  const companyBankAccountList = data.companyBankAccountList!
  //Currently, we only support a single default bank account per company.
  const bankAccount = companyBankAccountList.length > 0 ? companyBankAccountList[0]! : null

  const manageBankAccount = createMachine(
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
  return <Flow machine={manageBankAccount} onEvent={onEvent} />
}

export function BankAccount(props: BankAccountProps) {
  return (
    <BaseComponent {...props}>
      <BankAccountFlow {...props} />
    </BaseComponent>
  )
}
