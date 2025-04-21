import { createMachine } from 'robot3'
import { useBankAccountsGetSuspense } from '@gusto/embedded-api/react-query/bankAccountsGet'
import {
  BankAccountFormContextual,
  bankAccountStateMachine,
  type BankAccountContextInterface,
} from './bankAccountStateMachine'
import { BankAccountListContextual } from './bankAccountStateMachine'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'

export interface LocationsProps extends BaseComponentInterface {
  companyId: string
}

export function BankAccountFlow({ companyId, onEvent }: LocationsProps) {
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
