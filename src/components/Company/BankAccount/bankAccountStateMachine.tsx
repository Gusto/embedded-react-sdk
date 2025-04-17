import { state } from 'robot3'
import type { CompanyBankAccount } from '@gusto/embedded-api/models/components/companybankaccount'
import { BankAccountList } from './BankAccountList/BankAccountList'
import { BankAccountForm } from './BankAccountForm/BankAccountForm'
import { useFlowParams, type UseFlowParamsProps } from '@/components/Flow/hooks/useFlowParams'
import type { FlowContextInterface } from '@/components/Flow/Flow'

// type EventPayloads = {
//   [companyEvents.COMPANY_LOCATION_DONE]: undefined
//   [companyEvents.COMPANY_LOCATION_EDIT]: { uuid: string }
//   [companyEvents.COMPANY_LOCATION_CREATE]: undefined
// }

export interface BankAccountContextInterface extends FlowContextInterface {
  companyId: string
  bankAccount: CompanyBankAccount | null
}

function useBankAccountFlowParams(props: UseFlowParamsProps<BankAccountContextInterface>) {
  return useFlowParams(props)
}

export function BankAccountListContextual() {
  const { companyId, bankAccount, onEvent } = useBankAccountFlowParams({
    component: 'AddBankAccount',
    requiredParams: ['companyId'],
  })
  return <BankAccountList companyId={companyId} onEvent={onEvent} bankAccount={bankAccount} />
}
export function BankAccountFormContextual() {
  const { companyId, onEvent } = useBankAccountFlowParams({
    component: 'AddBankAccount',
    requiredParams: ['companyId'],
  })
  return <BankAccountForm companyId={companyId} onEvent={onEvent} />
}

export const bankAccountStateMachine = {
  index: state(),
}
