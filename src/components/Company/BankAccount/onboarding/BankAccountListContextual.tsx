import { BankAccountList } from '../BankAccountList/BankAccountList'
import type { BankAccountContextInterface } from '../shared/bankAccountComponents'
import { useFlow } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

/**
 * The onboarding bank account view.
 *
 * @remarks
 * Renders `BankAccountList` with its default children, which include the Continue button that
 * advances the onboarding flow. The management list variant omits that button.
 *
 * @internal
 */
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
