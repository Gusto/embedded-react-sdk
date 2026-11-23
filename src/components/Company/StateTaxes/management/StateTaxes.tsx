import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { stateTaxesBlockStateMachine } from './stateTaxesBlockStateMachine'
import type { StateTaxesBlockContextInterface } from './StateTaxesComponents'
import { StateTaxesCardContextual } from './StateTaxesComponents'
import type { BaseComponentInterface } from '@/components/Base'
import { BaseBoundaries } from '@/components/Base'
import { Flow } from '@/components/Flow/Flow'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'
import { useI18n } from '@/i18n'
import { useComponentDictionary } from '@/i18n/I18n'
import { pickNamespaceDictionary } from '@/i18n/pickNamespaceDictionary'
import type { DeepPartial, Resources, SupportedLanguages } from '@/types/Helpers'

/**
 * Translation overrides for {@link StateTaxes}, covering both its own namespace and
 * `Company.StateTaxes` — the state list, requirements form and tax rate history read their copy
 * from that namespace.
 *
 * @alpha
 */
export type StateTaxesDictionary = {
  [Lang in SupportedLanguages]?: {
    'Company.Management.StateTaxes'?: DeepPartial<Resources['Company.Management.StateTaxes']>
    'Company.StateTaxes'?: DeepPartial<Resources['Company.StateTaxes']>
  }
}

/**
 * Props for the {@link StateTaxes} management block.
 *
 * @alpha
 */
export interface StateTaxesProps extends Omit<
  BaseComponentInterface<'Company.Management.StateTaxes'>,
  'dictionary'
> {
  /** The associated company identifier. */
  companyId: string
  /** Translation overrides for this block and the state tax screens it opens. */
  dictionary?: StateTaxesDictionary
}

/**
 * A company's state tax setup, as a self-contained card and editor.
 *
 * @remarks
 * Opens on {@link StateTaxesCard} and swaps to the state tax screens when its action is used,
 * returning to the card via the "Back to state taxes" header.
 *
 * The editor opens on the list of states the company has tax requirements in. From each state's
 * actions menu the user either edits that state's requirements or opens its tax rate history,
 * where current, scheduled and past rates are listed and a new rate can be scheduled for one of
 * the effective dates the state accepts. Both return to the list.
 *
 * A company often updates several states, or schedules several rates, in one visit, so saving
 * keeps the editor open and the "State tax settings updated" alert surfaces on the card once the
 * user leaves. Backing out of one state returns to the list, not to the card.
 *
 * A scheduled rate cannot be cancelled: the tax requirements API has no operation for removing a
 * future-dated requirement set.
 *
 * The card is empty until the company has a work address in a state, since state tax
 * requirements follow from where employees work.
 *
 * Use this when a single state taxes surface is wanted on its own.
 * `CompanyManagement.Dashboard` composes {@link StateTaxesCard} directly instead, so that a
 * card's action routes within the dashboard rather than opening a second, nested editor.
 *
 * Requires the `companySettingsDashboard` unstable feature flag; mounting it without the flag
 * throws.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/management/stateTaxes/editRequested` | The card's action was used | `{ companyId: string }` |
 * | `company/stateTaxes/edit` | A state was selected for editing | `{ state: string }` |
 * | `company/stateTaxes/manageRates` | A state's tax rate history was opened | `{ state: string }` |
 * | `company/stateTaxes/updated` | A state's requirements were saved, raised by the form itself | — |
 * | `company/stateTaxes/rateScheduled` | A new effective-dated rate was saved. The API returns no body, so the payload echoes what was saved | `{ state, key, effectiveFrom, requirements }` |
 * | `company/management/stateTaxes/updated` | A state was saved or a rate scheduled | The same payload |
 * | `company/management/stateTaxes/editCancelled` | The editor was left via the back header | — |
 * | `company/management/stateTaxes/alertDismissed` | The success alert was dismissed | — |
 * | `cancel` | Editing one state was backed out of, returning to the list | — |
 *
 * @param props - See {@link StateTaxesProps}.
 * @returns The rendered state taxes management block.
 * @alpha
 *
 * @example
 * ```tsx
 * import { CompanyManagement } from '@gusto/embedded-react-sdk'
 *
 * function MyComponent() {
 *   return (
 *     <CompanyManagement.StateTaxes
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function StateTaxes({
  companyId,
  onEvent,
  dictionary,
  FallbackComponent,
  LoaderComponent,
}: StateTaxesProps) {
  useUnstableFeature('companySettingsDashboard', { throwIfDisabled: true })

  useI18n('Company.Management.StateTaxes')
  useComponentDictionary(
    'Company.Management.StateTaxes',
    pickNamespaceDictionary(dictionary, 'Company.Management.StateTaxes'),
  )
  // The editor renders the state list, requirements form and rate history, whose copy lives in
  // their own namespace and is otherwise never loaded from this block.
  useI18n('Company.StateTaxes')
  useComponentDictionary(
    'Company.StateTaxes',
    pickNamespaceDictionary(dictionary, 'Company.StateTaxes'),
  )

  const machine = useMemo(
    () =>
      createMachine(
        'card',
        stateTaxesBlockStateMachine,
        (ctx: StateTaxesBlockContextInterface) => ({
          ...ctx,
          component: StateTaxesCardContextual,
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
      componentName="Company.Management.StateTaxes"
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
    >
      <Flow machine={machine} onEvent={onEvent} />
    </BaseBoundaries>
  )
}
