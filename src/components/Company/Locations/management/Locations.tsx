import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { locationsBlockStateMachine } from './locationsBlockStateMachine'
import type { LocationsBlockContextInterface } from './LocationsComponents'
import { LocationsCardContextual } from './LocationsComponents'
import type { BaseComponentInterface } from '@/components/Base'
import { BaseBoundaries } from '@/components/Base'
import { Flow } from '@/components/Flow/Flow'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'
import { useI18n } from '@/i18n'
import { useComponentDictionary } from '@/i18n/I18n'
import { pickNamespaceDictionary } from '@/i18n/pickNamespaceDictionary'
import type { DeepPartial, Resources, SupportedLanguages } from '@/types/Helpers'

/**
 * Translation overrides for {@link Locations}, covering both its own namespace and
 * `Company.Locations` — the address list and form this block opens read their copy from that
 * namespace.
 *
 * @alpha
 */
export type LocationsDictionary = {
  [Lang in SupportedLanguages]?: {
    'Company.Management.Locations'?: DeepPartial<Resources['Company.Management.Locations']>
    'Company.Locations'?: DeepPartial<Resources['Company.Locations']>
  }
}

/**
 * Props for the {@link Locations} management block.
 *
 * @alpha
 */
export interface LocationsProps extends Omit<
  BaseComponentInterface<'Company.Management.Locations'>,
  'dictionary'
> {
  /** The associated company identifier. */
  companyId: string
  /** Translation overrides for this block and the address screens it opens. */
  dictionary?: LocationsDictionary
}

/**
 * A company's work addresses, as a self-contained card and editor.
 *
 * @remarks
 * Opens on {@link LocationsCard} and swaps to the address list when its Manage action is used,
 * where addresses can be added and edited. Returns to the card via the "Back to locations"
 * header.
 *
 * Unlike the single-form blocks, saving an address keeps the editor open: a company usually
 * adds several in one visit. The "Locations updated" alert therefore surfaces on the card once
 * the user leaves, rather than on each save. Cancelling an individual address form returns to
 * the list, not to the card.
 *
 * Use this when a single addresses surface is wanted on its own.
 * `CompanyManagement.Dashboard` composes {@link LocationsCard} directly instead, so that a
 * card's Manage action routes within the dashboard rather than opening a second, nested editor.
 *
 * Requires the `companySettingsDashboard` unstable feature flag; mounting it without the flag
 * throws.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/management/locations/editRequested` | The card's Manage action was used | `{ companyId: string }` |
 * | `company/location/add` | Add was used, raised by the list itself | — |
 * | `company/location/edit` | An address was selected for editing | `{ uuid: string }` |
 * | `company/location/add/done` | An address was created, raised by the form itself | Response from the create location API |
 * | `company/location/edit/done` | An address was updated, raised by the form itself | Response from the update location API |
 * | `company/management/locations/updated` | An address was created or updated | The same response |
 * | `company/management/locations/editCancelled` | The editor was left via the back header | — |
 * | `company/management/locations/alertDismissed` | The success alert was dismissed | — |
 * | `cancel` | An individual address form was cancelled, returning to the list | — |
 *
 * @param props - See {@link LocationsProps}.
 * @returns The rendered locations management block.
 * @alpha
 *
 * @example
 * ```tsx
 * import { CompanyManagement } from '@gusto/embedded-react-sdk'
 *
 * function MyComponent() {
 *   return (
 *     <CompanyManagement.Locations
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function Locations({
  companyId,
  onEvent,
  dictionary,
  FallbackComponent,
  LoaderComponent,
}: LocationsProps) {
  useUnstableFeature('companySettingsDashboard', { throwIfDisabled: true })

  useI18n('Company.Management.Locations')
  useComponentDictionary(
    'Company.Management.Locations',
    pickNamespaceDictionary(dictionary, 'Company.Management.Locations'),
  )
  // The editor renders the address list and form, whose copy lives in their own namespace and
  // is otherwise never loaded from this block.
  useI18n('Company.Locations')
  useComponentDictionary(
    'Company.Locations',
    pickNamespaceDictionary(dictionary, 'Company.Locations'),
  )

  const machine = useMemo(
    () =>
      createMachine('card', locationsBlockStateMachine, (ctx: LocationsBlockContextInterface) => ({
        ...ctx,
        component: LocationsCardContextual,
        companyId,
        successAlert: null,
        pendingAlert: null,
        LoaderComponent,
      })),
    [companyId, LoaderComponent],
  )

  return (
    <BaseBoundaries
      componentName="Company.Management.Locations"
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
    >
      <Flow machine={machine} onEvent={onEvent} />
    </BaseBoundaries>
  )
}
