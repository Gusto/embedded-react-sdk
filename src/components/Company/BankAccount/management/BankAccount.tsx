import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { bankAccountBlockStateMachine } from './bankAccountBlockStateMachine'
import type { BankAccountBlockContextInterface } from './BankAccountComponents'
import { BankAccountCardContextual } from './BankAccountComponents'
import type { BaseComponentInterface } from '@/components/Base'
import { BaseBoundaries } from '@/components/Base'
import { Flow } from '@/components/Flow/Flow'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'
import { useI18n } from '@/i18n'
import { useComponentDictionary } from '@/i18n/I18n'
import { pickNamespaceDictionary } from '@/i18n/pickNamespaceDictionary'
import type { DeepPartial, Resources, SupportedLanguages } from '@/types/Helpers'

/**
 * Translation overrides for {@link BankAccount}, covering both its own namespace and
 * `Company.BankAccount` — the account view, add form and verification screens this block opens
 * read their copy from that namespace.
 *
 * @alpha
 */
export type BankAccountDictionary = {
  [Lang in SupportedLanguages]?: {
    'Company.Management.BankAccount'?: DeepPartial<Resources['Company.Management.BankAccount']>
    'Company.BankAccount'?: DeepPartial<Resources['Company.BankAccount']>
  }
}

/**
 * Props for the {@link BankAccount} management block.
 *
 * @alpha
 */
export interface BankAccountProps extends Omit<
  BaseComponentInterface<'Company.Management.BankAccount'>,
  'dictionary'
> {
  /** The associated company identifier. */
  companyId: string
  /** Translation overrides for this block and the account screens it opens. */
  dictionary?: BankAccountDictionary
}

/**
 * A company's funding bank account, as a self-contained card and editor.
 *
 * @remarks
 * Opens on {@link BankAccountCard} and swaps to the account screens when its action is used,
 * returning to the card via the "Back to bank account" header. Gusto supports one default
 * company bank account, so this is a single account rather than a list.
 *
 * The editor opens on the add form when no account is on file and on the account view when one
 * is, where it can be changed or its micro-deposits verified. Adding and verifying are separate
 * steps of one visit, so neither returns to the card: the "Bank account updated" alert surfaces
 * once the user leaves. Backing out of verification returns to the account view, not to the
 * card.
 *
 * Use this when a single bank account surface is wanted on its own.
 * `CompanyManagement.Dashboard` composes {@link BankAccountCard} directly instead, so that a
 * card's action routes within the dashboard rather than opening a second, nested editor.
 *
 * Requires the `companySettingsDashboard` unstable feature flag; mounting it without the flag
 * throws.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/management/bankAccount/editRequested` | The card's action was used | `{ companyId: string }` |
 * | `company/bankAccount/change` | Change was used, raised by the view itself | — |
 * | `company/bankAccount/verify` | Verification was started, raised by the view itself | The {@link APIModels.CompanyBankAccount} |
 * | `company/bankAccount/created` | An account was added, raised by the form itself | The created {@link APIModels.CompanyBankAccount} |
 * | `company/bankAccount/verified` | Micro-deposits were verified, raised by the form itself | The verified {@link APIModels.CompanyBankAccount} |
 * | `company/management/bankAccount/updated` | An account was added or verified | The same account |
 * | `company/management/bankAccount/editCancelled` | The editor was left via the back header | — |
 * | `company/management/bankAccount/alertDismissed` | The success alert was dismissed | — |
 * | `cancel` | Verification was backed out of, returning to the account view | — |
 *
 * @param props - See {@link BankAccountProps}.
 * @returns The rendered bank account management block.
 * @alpha
 *
 * @example
 * ```tsx
 * import { CompanyManagement } from '@gusto/embedded-react-sdk'
 *
 * function MyComponent() {
 *   return (
 *     <CompanyManagement.BankAccount
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function BankAccount({
  companyId,
  onEvent,
  dictionary,
  FallbackComponent,
  LoaderComponent,
}: BankAccountProps) {
  useUnstableFeature('companySettingsDashboard', { throwIfDisabled: true })

  useI18n('Company.Management.BankAccount')
  useComponentDictionary(
    'Company.Management.BankAccount',
    pickNamespaceDictionary(dictionary, 'Company.Management.BankAccount'),
  )
  // The editor renders the account view, add form and verification screens, whose copy lives
  // in their own namespace and is otherwise never loaded from this block.
  useI18n('Company.BankAccount')
  useComponentDictionary(
    'Company.BankAccount',
    pickNamespaceDictionary(dictionary, 'Company.BankAccount'),
  )

  const machine = useMemo(
    () =>
      createMachine(
        'card',
        bankAccountBlockStateMachine,
        (ctx: BankAccountBlockContextInterface) => ({
          ...ctx,
          component: BankAccountCardContextual,
          companyId,
          successAlert: null,
          pendingAlert: null,
          LoaderComponent,
        }),
      ),
    [companyId, LoaderComponent],
  )

  return (
    <BaseBoundaries
      componentName="Company.Management.BankAccount"
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
    >
      <Flow machine={machine} onEvent={onEvent} />
    </BaseBoundaries>
  )
}
