import { useMemo } from 'react'
import { createMachine } from 'robot3'
import { useBankAccountsGetSuspense } from '@gusto/embedded-api/react-query/bankAccountsGet'
import {
  BankAccountFormContextual,
  type BankAccountContextInterface,
} from './BankAccountComponents'
import { bankAccountStateMachine } from './stateMachine'
import { BankAccountListContextual } from './BankAccountComponents'

interface UseCompanyBankAccountProps {
  companyId: string
}

export function useCompanyBankAccount({ companyId }: UseCompanyBankAccountProps) {
  const { data } = useBankAccountsGetSuspense({ companyId })
  const companyBankAccountList = data.companyBankAccounts!
  const bankAccount = companyBankAccountList.length > 0 ? companyBankAccountList[0]! : null

  const machine = useMemo(
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

  return {
    data: {
      bankAccount,
      companyBankAccountList,
    },
    actions: {},
    meta: {
      machine,
    },
  }
}
