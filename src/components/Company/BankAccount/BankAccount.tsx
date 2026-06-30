import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { useBankAccountsGetSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/bankAccountsGet'
import {
  BankAccountFormContextual,
  type BankAccountContextInterface,
} from './BankAccountComponents'
import { bankAccountStateMachine } from './stateMachine'
import { BankAccountListContextual } from './BankAccountComponents'
import { Flow } from '@/components/Flow/Flow'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'

/**
 * Props for the {@link BankAccount} component.
 *
 * @public
 */
export interface BankAccountProps extends BaseComponentInterface<'Company.BankAccount'> {
  /** Identifier of the company whose bank account is being managed. */
  companyId: string
}

function BankAccountFlow({ companyId, onEvent, dictionary }: BankAccountProps) {
  useComponentDictionary('Company.BankAccount', dictionary)
  const { data } = useBankAccountsGetSuspense({ companyId })
  const companyBankAccountList = data.companyBankAccounts!
  //Currently, we only support a single default bank account per company.
  const bankAccount = companyBankAccountList.length > 0 ? companyBankAccountList[0]! : null

  const manageBankAccount = useMemo(
    () =>
      createMachine(
        bankAccount ? 'viewBankAccount' : 'addBankAccount',
        bankAccountStateMachine,
        (initialContext: BankAccountContextInterface) => ({
          ...initialContext,
          component: bankAccount ? BankAccountListContextual : BankAccountFormContextual,
          companyId,
          bankAccount,
          showVerifiedMessage: false,
        }),
      ),
    [companyId, bankAccount],
  )
  return <Flow machine={manageBankAccount} onEvent={onEvent} />
}

/**
 * Manages a company's bank account — adding, viewing, and verifying it.
 *
 * @remarks
 * Currently supports a single default bank account per company. When no bank account exists,
 * the component renders the add-account form; once one is on file it renders the list view
 * with controls to change or verify the account via micro-deposits.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `COMPANY_BANK_ACCOUNT_CHANGE` | Fired when the user chooses to change an existing bank account | — |
 * | `COMPANY_BANK_ACCOUNT_CREATED` | Fired when a new bank account is created | The created {@link APIModels.CompanyBankAccount} |
 * | `COMPANY_BANK_ACCOUNT_VERIFY` | Fired when the user chooses to verify the bank account after micro-deposits are made | — |
 * | `COMPANY_BANK_ACCOUNT_VERIFIED` | Fired when the bank account has been successfully verified | The verified {@link APIModels.CompanyBankAccount} |
 * | `COMPANY_BANK_ACCOUNT_DONE` | Fired when the user chooses to proceed to the next step | — |
 *
 * @param props - Component props including the target `companyId`.
 * @returns The bank account management surface for the given company.
 * @public
 */
export function BankAccount(props: BankAccountProps) {
  return (
    <BaseComponent {...props}>
      <BankAccountFlow {...props} />
    </BaseComponent>
  )
}
