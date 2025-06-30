import type { CompanyBankAccount } from '@gusto/embedded-api/models/components/companybankaccount'
import { BankAccountList } from './BankAccountList/BankAccountList'
import { BankAccountForm } from './BankAccountForm/BankAccountForm'
import { BankAccountVerify } from './BankAccountVerify/BankAccountVerify'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { componentEvents } from '@/shared/constants'
import { ensureRequired } from '@/helpers/ensureRequired'

export type EventPayloads = {
  [componentEvents.COMPANY_BANK_ACCOUNT_CREATED]: CompanyBankAccount
  [componentEvents.COMPANY_BANK_ACCOUNT_VERIFIED]: CompanyBankAccount
  [componentEvents.COMPANY_BANK_ACCOUNT_CHANGE]: undefined
}

export interface BankAccountContextInterface extends FlowContextInterface {
  companyId: string
  bankAccount: CompanyBankAccount | null
  showVerifiedMessage?: boolean
}

export function BankAccountListContextual() {
  const { companyId, showVerifiedMessage, onEvent } = useFlow<BankAccountContextInterface>()
  return (
    <BankAccountList
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      showVerifiedMessage={showVerifiedMessage}
    />
  )
}
export function BankAccountFormContextual() {
  const { companyId, onEvent, bankAccount } = useFlow<BankAccountContextInterface>()
  return (
    <BankAccountForm
      companyId={ensureRequired(companyId)}
      onEvent={onEvent}
      isEditing={!!bankAccount}
    />
  )
}
export function BankAccountVerifyContextual() {
  const { bankAccount, companyId, onEvent } = useFlow<BankAccountContextInterface>()
  if (!bankAccount) return null
  return (
    <BankAccountVerify
      companyId={ensureRequired(companyId)}
      bankAccountId={bankAccount.uuid}
      onEvent={onEvent}
    />
  )
}
