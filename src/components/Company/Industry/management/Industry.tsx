import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { industryStateMachine } from './industryStateMachine'
import type { IndustryContextInterface } from './IndustryComponents'
import { IndustryCardContextual } from './IndustryComponents'
import type { BaseComponentInterface } from '@/components/Base'
import { BaseBoundaries } from '@/components/Base'
import { Flow } from '@/components/Flow/Flow'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'
import { useI18n } from '@/i18n'
import { useComponentDictionary } from '@/i18n/I18n'
import { pickNamespaceDictionary } from '@/i18n/pickNamespaceDictionary'
import type { DeepPartial, Resources, SupportedLanguages } from '@/types/Helpers'

/**
 * Translation overrides for {@link Industry}, covering both its own namespace and
 * `Company.Industry` — the industry form this block opens is the onboarding form, which reads
 * its field copy from that namespace.
 *
 * @alpha
 */
export type IndustryDictionary = {
  [Lang in SupportedLanguages]?: {
    'Company.Management.Industry'?: DeepPartial<Resources['Company.Management.Industry']>
    'Company.Industry'?: DeepPartial<Resources['Company.Industry']>
  }
}

/**
 * Props for the {@link Industry} management block.
 *
 * @alpha
 */
export interface IndustryProps extends Omit<
  BaseComponentInterface<'Company.Management.Industry'>,
  'dictionary'
> {
  /** The associated company identifier. */
  companyId: string
  /** Translation overrides for this block and the industry form it opens. */
  dictionary?: IndustryDictionary
}

/**
 * A company's industry classification, as a self-contained card and editor.
 *
 * @remarks
 * Opens on {@link IndustryCard} and swaps to the industry form when its Edit action is used,
 * returning to the card once the classification is saved or the "Back to industry" header is
 * used. A successful save shows a dismissible alert on the card.
 *
 * Use this when a single industry surface is wanted on its own. `CompanyManagement.Dashboard`
 * composes {@link IndustryCard} directly instead, so that a card's Edit action routes within
 * the dashboard rather than opening a second, nested editor.
 *
 * Requires the `companySettingsDashboard` unstable feature flag; mounting it without the flag
 * throws.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/management/industry/editRequested` | The card's Edit action was used | `{ companyId: string }` |
 * | `company/industry/selected` | The classification was saved, raised by the form itself | The updated {@link APIModels.Industry} |
 * | `company/management/industry/updated` | The classification was saved | The updated {@link APIModels.Industry} |
 * | `company/management/industry/editCancelled` | The editor was left via the back header | — |
 * | `company/management/industry/alertDismissed` | The success alert was dismissed | — |
 *
 * @param props - See {@link IndustryProps}.
 * @returns The rendered industry management block.
 * @alpha
 *
 * @example
 * ```tsx
 * import { CompanyManagement } from '@gusto/embedded-react-sdk'
 *
 * function MyComponent() {
 *   return (
 *     <CompanyManagement.Industry
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function Industry({
  companyId,
  onEvent,
  dictionary,
  FallbackComponent,
  LoaderComponent,
}: IndustryProps) {
  useUnstableFeature('companySettingsDashboard', { throwIfDisabled: true })

  useI18n('Company.Management.Industry')
  useComponentDictionary(
    'Company.Management.Industry',
    pickNamespaceDictionary(dictionary, 'Company.Management.Industry'),
  )
  // The edit screen renders the onboarding industry form, whose copy lives in its own
  // namespace and is otherwise never loaded from this block.
  useI18n('Company.Industry')
  useComponentDictionary(
    'Company.Industry',
    pickNamespaceDictionary(dictionary, 'Company.Industry'),
  )

  const machine = useMemo(
    () =>
      createMachine('card', industryStateMachine, (ctx: IndustryContextInterface) => ({
        ...ctx,
        component: IndustryCardContextual,
        companyId,
        successAlert: null,
        LoaderComponent,
      })),
    [companyId, LoaderComponent],
  )

  return (
    <BaseBoundaries
      componentName="Company.Management.Industry"
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
    >
      <Flow machine={machine} onEvent={onEvent} />
    </BaseBoundaries>
  )
}
