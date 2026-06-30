import type { CompanyBankAccount } from '@gusto/embedded-api-v-2026-06-15/models/components/companybankaccount'
import { BankAccountList } from './BankAccountList/BankAccountList'
import { BankAccountForm } from './BankAccountForm/BankAccountForm'
import { BankAccountVerify } from './BankAccountVerify/BankAccountVerify'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { componentEvents } from '@/shared/constants'
import { ensureRequired } from '@/helpers/ensureRequired'

/** @internal */
export type EventPayloads = {
  [componentEvents.COMPANY_BANK_ACCOUNT_CREATED]: CompanyBankAccount
  [componentEvents.COMPANY_BANK_ACCOUNT_VERIFIED]: CompanyBankAccount
  [componentEvents.COMPANY_BANK_ACCOUNT_CHANGE]: undefined
}

/** @internal */
export interface BankAccountContextInterface extends FlowContextInterface {
  /** Identifier of the company whose bank account is being managed. */
  companyId: string
  /** Currently configured bank account, or `null` when none is on file. */
  bankAccount: CompanyBankAccount | null
  /** Whether the list view should surface a success banner after verification. */
  showVerifiedMessage?: boolean
}

/** @internal */
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
/** @internal */
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
/** @internal */
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
