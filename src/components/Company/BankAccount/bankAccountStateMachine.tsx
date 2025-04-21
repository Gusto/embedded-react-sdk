import { reduce, state, state as final, transition } from 'robot3'
import type { CompanyBankAccount } from '@gusto/embedded-api/models/components/companybankaccount'
import { BankAccountList } from './BankAccountList/BankAccountList'
import { BankAccountForm } from './BankAccountForm/BankAccountForm'
import { BankAccountVerify } from './BankAccountVerify/BankAccountVerify'
import { useFlowParams, type UseFlowParamsProps } from '@/components/Flow/hooks/useFlowParams'
import type { FlowContextInterface } from '@/components/Flow/Flow'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType } from '@/types/Helpers'

type EventPayloads = {
  [componentEvents.COMPANY_BANK_ACCOUNT_CREATED]: CompanyBankAccount
  [componentEvents.COMPANY_BANK_ACCOUNT_VERIFIED]: CompanyBankAccount
  [componentEvents.COMPANY_BANK_ACCOUNT_CHANGE]: undefined
}

export interface BankAccountContextInterface extends FlowContextInterface {
  companyId: string
  bankAccount: CompanyBankAccount | null
  showVerifiedMessage?: boolean
}

function useBankAccountFlowParams(props: UseFlowParamsProps<BankAccountContextInterface>) {
  return useFlowParams(props)
}

export function BankAccountListContextual() {
  const { companyId, showVerifiedMessage, onEvent } = useBankAccountFlowParams({
    component: 'BankAccountList',
    requiredParams: ['companyId'],
  })
  return (
    <BankAccountList
      onEvent={onEvent}
      companyId={companyId}
      showVerifiedMessage={showVerifiedMessage}
    />
  )
}
export function BankAccountFormContextual() {
  const { companyId, onEvent } = useBankAccountFlowParams({
    component: 'BankAccountForm',
    requiredParams: ['companyId'],
  })
  return <BankAccountForm companyId={companyId} onEvent={onEvent} />
}
export function BankAccountVerifyContextual() {
  const { bankAccount, companyId, onEvent } = useBankAccountFlowParams({
    component: 'BankAccountVerify',
    requiredParams: ['bankAccount', 'companyId'],
  })
  if (!bankAccount) return null
  return (
    <BankAccountVerify companyId={companyId} bankAccountId={bankAccount.uuid} onEvent={onEvent} />
  )
}

export const bankAccountStateMachine = {
  viewBankAccount: state(
    transition(
      componentEvents.COMPANY_BANK_ACCOUNT_CHANGE,
      'addBankAccount',
      reduce((ctx: BankAccountContextInterface) => ({
        ...ctx,
        component: BankAccountFormContextual,
        showVerifiedMessage: false,
      })),
    ),
    transition(
      componentEvents.COMPANY_BANK_ACCOUNT_VERIFY,
      'verifyBankAccount',
      reduce((ctx: BankAccountContextInterface) => ({
        ...ctx,
        component: BankAccountVerifyContextual,
        showVerifiedMessage: false,
      })),
    ),
    transition(componentEvents.COMPANY_BANK_ACCOUNT_DONE, 'done'),
  ),
  addBankAccount: state(
    transition(
      componentEvents.COMPANY_BANK_ACCOUNT_CREATED,
      'viewBankAccount',
      reduce(
        (
          ctx: BankAccountContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.COMPANY_BANK_ACCOUNT_CREATED>,
        ) => ({
          ...ctx,
          component: BankAccountListContextual,
          bankAccount: ev.payload,
        }),
      ),
    ),
  ),
  verifyBankAccount: state(
    transition(
      componentEvents.COMPANY_BANK_ACCOUNT_VERIFIED,
      'viewBankAccount',
      reduce(
        (
          ctx: BankAccountContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.COMPANY_BANK_ACCOUNT_VERIFIED>,
        ): BankAccountContextInterface => ({
          ...ctx,
          component: BankAccountListContextual,
          bankAccount: ev.payload,
          showVerifiedMessage: ev.payload.verificationStatus === 'verified',
        }),
      ),
    ),
    transition(
      componentEvents.CANCEL,
      'viewBankAccount',
      reduce((ctx: BankAccountContextInterface) => ({
        ...ctx,
        component: BankAccountListContextual,
      })),
    ),
  ),
  done: final(),
}
