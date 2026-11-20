import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { federalTaxesStateMachine } from './federalTaxesStateMachine'
import type { FederalTaxesContextInterface } from './FederalTaxesComponents'
import { FederalTaxesCardContextual } from './FederalTaxesComponents'
import type { BaseComponentInterface } from '@/components/Base'
import { BaseBoundaries } from '@/components/Base'
import { Flow } from '@/components/Flow/Flow'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'
import { useI18n } from '@/i18n'
import { useComponentDictionary } from '@/i18n/I18n'
import { pickNamespaceDictionary } from '@/i18n/pickNamespaceDictionary'
import type { DeepPartial, Resources, SupportedLanguages } from '@/types/Helpers'

/**
 * Translation overrides for {@link FederalTaxes}, covering both its own namespace and
 * `Company.FederalTaxes` — the form this block opens is the onboarding form, which reads its
 * field copy from that namespace.
 *
 * @alpha
 */
export type FederalTaxesDictionary = {
  [Lang in SupportedLanguages]?: {
    'Company.Management.FederalTaxes'?: DeepPartial<Resources['Company.Management.FederalTaxes']>
    'Company.FederalTaxes'?: DeepPartial<Resources['Company.FederalTaxes']>
  }
}

/**
 * Props for the {@link FederalTaxes} management block.
 *
 * @alpha
 */
export interface FederalTaxesProps extends Omit<
  BaseComponentInterface<'Company.Management.FederalTaxes'>,
  'dictionary'
> {
  /** The associated company identifier. */
  companyId: string
  /** Translation overrides for this block and the form it opens. */
  dictionary?: FederalTaxesDictionary
}

/**
 * A company's federal tax details, as a self-contained card and editor.
 *
 * @remarks
 * Opens on {@link FederalTaxesCard} and swaps to the federal tax details form when its Edit
 * action is used, returning to the card once the details are saved or the "Back to federal
 * taxes" header is used. A successful save shows a dismissible alert on the card.
 *
 * The EIN itself is never returned by the API, so the card reports whether one is on file and
 * verified rather than the number.
 *
 * Use this when a single federal taxes surface is wanted on its own.
 * `CompanyManagement.Dashboard` composes {@link FederalTaxesCard} directly instead, so that a
 * card's Edit action routes within the dashboard rather than opening a second, nested editor.
 *
 * Requires the `companySettingsDashboard` unstable feature flag; mounting it without the flag
 * throws.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/management/federalTaxes/editRequested` | The card's Edit action was used | `{ companyId: string }` |
 * | `company/federalTaxes/updated` | The details were saved, raised by the form itself | The updated {@link APIModels.FederalTaxDetails} |
 * | `company/federalTaxes/done` | The form finished, raised by the form itself | — |
 * | `company/management/federalTaxes/updated` | The details were saved | The updated {@link APIModels.FederalTaxDetails} |
 * | `company/management/federalTaxes/editCancelled` | The editor was left via the back header | — |
 * | `company/management/federalTaxes/alertDismissed` | The success alert was dismissed | — |
 *
 * @param props - See {@link FederalTaxesProps}.
 * @returns The rendered federal taxes management block.
 * @alpha
 *
 * @example
 * ```tsx
 * import { CompanyManagement } from '@gusto/embedded-react-sdk'
 *
 * function MyComponent() {
 *   return (
 *     <CompanyManagement.FederalTaxes
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function FederalTaxes({
  companyId,
  onEvent,
  dictionary,
  FallbackComponent,
  LoaderComponent,
}: FederalTaxesProps) {
  useUnstableFeature('companySettingsDashboard', { throwIfDisabled: true })

  useI18n('Company.Management.FederalTaxes')
  useComponentDictionary(
    'Company.Management.FederalTaxes',
    pickNamespaceDictionary(dictionary, 'Company.Management.FederalTaxes'),
  )
  // The edit screen renders the onboarding federal taxes form, whose copy lives in its own
  // namespace and is otherwise never loaded from this block.
  useI18n('Company.FederalTaxes')
  useComponentDictionary(
    'Company.FederalTaxes',
    pickNamespaceDictionary(dictionary, 'Company.FederalTaxes'),
  )

  const machine = useMemo(
    () =>
      createMachine('card', federalTaxesStateMachine, (ctx: FederalTaxesContextInterface) => ({
        ...ctx,
        component: FederalTaxesCardContextual,
        companyId,
        successAlert: null,
        LoaderComponent,
      })),
    [companyId, LoaderComponent],
  )

  return (
    <BaseBoundaries
      componentName="Company.Management.FederalTaxes"
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
    >
      <Flow machine={machine} onEvent={onEvent} />
    </BaseBoundaries>
  )
}
