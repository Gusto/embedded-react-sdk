import { useTranslation } from 'react-i18next'
import { BankAccountList } from '../BankAccountList/BankAccountList'
import { AccountView } from '../BankAccountList/AccountView'
import { Head } from '../BankAccountList/Head'
import { useBankAccount } from '../BankAccountList/context'
import type { BankAccountContextInterface } from '../shared/bankAccountComponents'
import { ActionsLayout } from '@/components/Common'
import { useFlow } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ensureRequired } from '@/helpers/ensureRequired'

/**
 * Change-only actions for the management bank account view.
 *
 * @remarks
 * The onboarding actions carry Change alongside a Continue that advances the onboarding flow.
 * Here the view is a resting screen with nothing to continue to — the block's back header is
 * the way out — so only Change remains.
 *
 * Verification is unaffected: its action lives in the list's `Head`, inside the pending-status
 * alert, and is rendered by both surfaces.
 *
 * @internal
 */
function BankAccountManagementActions() {
  const { handleChange } = useBankAccount()
  const { t } = useTranslation('Company.BankAccount')
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      <Components.Button variant="secondary" onClick={handleChange}>
        {t('changeBankAccountCta')}
      </Components.Button>
    </ActionsLayout>
  )
}

/**
 * The steady-state bank account view.
 *
 * @remarks
 * Composes `BankAccountList` with its heading, verification alert and account details, under
 * Change-only actions. Supplying children replaces the list's defaults, which is how the
 * Continue button is dropped.
 *
 * @internal
 */
export function BankAccountManagementListContextual() {
  const { companyId, showVerifiedMessage, onEvent } = useFlow<BankAccountContextInterface>()
  return (
    <BankAccountList
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      showVerifiedMessage={showVerifiedMessage}
    >
      <Head />
      <AccountView />
      <BankAccountManagementActions />
    </BankAccountList>
  )
}
