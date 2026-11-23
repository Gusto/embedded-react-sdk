import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { signatoryStateMachine } from './signatoryStateMachine'
import type { SignatoryContextInterface } from './SignatoryComponents'
import { SignatoryCardContextual } from './SignatoryComponents'
import type { BaseComponentInterface } from '@/components/Base'
import { BaseBoundaries } from '@/components/Base'
import { Flow } from '@/components/Flow/Flow'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'
import { useI18n } from '@/i18n'
import { useComponentDictionary } from '@/i18n/I18n'
import { pickNamespaceDictionary } from '@/i18n/pickNamespaceDictionary'
import type { DeepPartial, Resources, SupportedLanguages } from '@/types/Helpers'

/**
 * Translation overrides for {@link Signatory}, covering both its own namespace and
 * `Company.AssignSignatory` — the assign-signatory screens this block opens read their copy
 * from that namespace.
 *
 * @alpha
 */
export type SignatoryDictionary = {
  [Lang in SupportedLanguages]?: {
    'Company.Management.Signatory'?: DeepPartial<Resources['Company.Management.Signatory']>
    'Company.AssignSignatory'?: DeepPartial<Resources['Company.AssignSignatory']>
  }
}

/**
 * Props for the {@link Signatory} management block.
 *
 * @alpha
 */
export interface SignatoryProps extends Omit<
  BaseComponentInterface<'Company.Management.Signatory'>,
  'dictionary'
> {
  /** The associated company identifier. */
  companyId: string
  /** Translation overrides for this block and the assign-signatory screens it opens. */
  dictionary?: SignatoryDictionary
}

/**
 * The person authorized to sign a company's forms, as a self-contained card and editor.
 *
 * @remarks
 * Opens on {@link SignatoryCard} and swaps to the assign-signatory screens when its action is
 * used, returning to the card once a signatory is saved or the "Back to signatory" header is
 * used. A company has at most one signatory, so this is a single person rather than a list.
 *
 * The editor offers two routes to the same outcome — fill in the signatory's details directly,
 * or invite them to supply their own — and either completing route returns to the card.
 * Opening it from the empty state assigns someone new; opening it with a signatory on file
 * amends that record.
 *
 * Use this when a single signatory surface is wanted on its own.
 * `CompanyManagement.Dashboard` composes {@link SignatoryCard} directly instead, so that a
 * card's action routes within the dashboard rather than opening a second, nested editor.
 *
 * Requires the `companySettingsDashboard` unstable feature flag; mounting it without the flag
 * throws.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/management/signatory/editRequested` | The card's action was used | `{ companyId: string, signatoryId?: string }` |
 * | `company/signatory/assignSignatory/modeUpdated` | The direct-entry/invite choice changed | The selected mode |
 * | `company/signatory/assignSignatory/done` | A signatory was saved, raised by the screens themselves | — |
 * | `company/management/signatory/updated` | A signatory was saved | — |
 * | `company/management/signatory/editCancelled` | The editor was left via the back header | — |
 * | `company/management/signatory/alertDismissed` | The success alert was dismissed | — |
 *
 * @param props - See {@link SignatoryProps}.
 * @returns The rendered signatory management block.
 * @alpha
 *
 * @example
 * ```tsx
 * import { CompanyManagement } from '@gusto/embedded-react-sdk'
 *
 * function MyComponent() {
 *   return (
 *     <CompanyManagement.Signatory
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function Signatory({
  companyId,
  onEvent,
  dictionary,
  FallbackComponent,
  LoaderComponent,
}: SignatoryProps) {
  useUnstableFeature('companySettingsDashboard', { throwIfDisabled: true })

  useI18n('Company.Management.Signatory')
  useComponentDictionary(
    'Company.Management.Signatory',
    pickNamespaceDictionary(dictionary, 'Company.Management.Signatory'),
  )
  // The editor renders the assign-signatory screens, whose copy lives in their own namespace
  // and is otherwise never loaded from this block.
  useI18n('Company.AssignSignatory')
  useComponentDictionary(
    'Company.AssignSignatory',
    pickNamespaceDictionary(dictionary, 'Company.AssignSignatory'),
  )

  const machine = useMemo(
    () =>
      createMachine('card', signatoryStateMachine, (ctx: SignatoryContextInterface) => ({
        ...ctx,
        component: SignatoryCardContextual,
        companyId,
        successAlert: null,
        LoaderComponent,
      })),
    [companyId, LoaderComponent],
  )

  return (
    <BaseBoundaries
      componentName="Company.Management.Signatory"
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
    >
      <Flow machine={machine} onEvent={onEvent} />
    </BaseBoundaries>
  )
}
