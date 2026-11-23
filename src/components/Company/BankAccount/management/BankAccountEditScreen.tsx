import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { useBankAccountsGetSuspense } from '@gusto/embedded-api/react-query/bankAccountsGet'
import type { BankAccountContextInterface } from '../shared/bankAccountComponents'
import { BankAccountFormContextual } from '../shared/bankAccountComponents'
import { createBankAccountMachine } from '../shared/bankAccountMachine'
import { BankAccountManagementListContextual } from './BankAccountManagementComponents'
import { translateEvents } from '@/components/Company/shared/translateEvents'
import { Flow } from '@/components/Flow/Flow'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

/**
 * Props for {@link BankAccountEditScreen}.
 *
 * @internal
 */
export interface BankAccountEditScreenProps extends BaseComponentInterface<'Company.BankAccount'> {
  /** The associated company identifier. */
  companyId: string
}

function BankAccountEditFlow({ companyId, onEvent }: BankAccountEditScreenProps) {
  const { data } = useBankAccountsGetSuspense({ companyId })
  const companyBankAccountList = data.companyBankAccounts ?? []
  // Gusto supports a single default company bank account, so this is one account rather
  // than a list.
  const bankAccount = companyBankAccountList.length > 0 ? companyBankAccountList[0] : null

  const machine = useMemo(
    () =>
      createMachine(
        bankAccount ? 'viewBankAccount' : 'addBankAccount',
        createBankAccountMachine(BankAccountManagementListContextual),
        (initialContext: BankAccountContextInterface) => ({
          ...initialContext,
          component: bankAccount ? BankAccountManagementListContextual : BankAccountFormContextual,
          companyId,
          bankAccount: bankAccount ?? null,
          showVerifiedMessage: false,
        }),
      ),
    [companyId, bankAccount],
  )

  return (
    <Flow
      machine={machine}
      onEvent={translateEvents(onEvent, {
        [componentEvents.COMPANY_BANK_ACCOUNT_CREATED]:
          componentEvents.COMPANY_MANAGEMENT_BANK_ACCOUNT_UPDATED,
        [componentEvents.COMPANY_BANK_ACCOUNT_VERIFIED]:
          componentEvents.COMPANY_MANAGEMENT_BANK_ACCOUNT_UPDATED,
      })}
    />
  )
}

/**
 * The bank account view, add and verify screens as a single management surface.
 *
 * @remarks
 * Mounted by both management orchestrators — the {@link BankAccount} block and
 * `CompanyManagement.DashboardFlow` — so the translation to
 * `company/management/bankAccount/updated` lives in one place that both reach.
 *
 * Opens on the add form when the company has no account on file and on the Change-only view
 * when it does, which is what makes `company/bankAccount/done` unnecessary here: there is no
 * Continue to raise it.
 *
 * Adding an account and verifying its micro-deposits are separate steps of one visit, so both
 * map to the same management event and the hosting machine treats it as "stay" rather than
 * "leave".
 *
 * The inner `CANCEL` that returns the micro-deposit form to the view stays inside this `Flow`.
 * `Flow` re-emits it upward, which is precisely why no hosting machine may declare a `CANCEL`
 * transition.
 *
 * @param props - See {@link BankAccountEditScreenProps}.
 * @returns The bank account sub-flow wired for a management surface.
 * @internal
 */
export function BankAccountEditScreen(props: BankAccountEditScreenProps) {
  return (
    <BaseComponent {...props}>
      <BankAccountEditFlow {...props} />
    </BaseComponent>
  )
}
