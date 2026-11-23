import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { companyFormsBlockStateMachine } from './companyFormsBlockStateMachine'
import type { CompanyFormsBlockContextInterface } from './CompanyFormsComponents'
import { CompanyFormsCardContextual } from './CompanyFormsComponents'
import type { BaseComponentInterface } from '@/components/Base'
import { BaseBoundaries } from '@/components/Base'
import { Flow } from '@/components/Flow/Flow'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'
import { useI18n } from '@/i18n'
import { useComponentDictionary } from '@/i18n/I18n'
import { pickNamespaceDictionary } from '@/i18n/pickNamespaceDictionary'
import type { DeepPartial, Resources, SupportedLanguages } from '@/types/Helpers'

/**
 * Translation overrides for {@link CompanyForms}, covering its own namespace and the two the
 * document surface reads from — `Company.DocumentList` for the list and
 * `Company.SignatureForm` for signing.
 *
 * @alpha
 */
export type CompanyFormsDictionary = {
  [Lang in SupportedLanguages]?: {
    'Company.Management.CompanyForms'?: DeepPartial<Resources['Company.Management.CompanyForms']>
    'Company.DocumentList'?: DeepPartial<Resources['Company.DocumentList']>
    'Company.SignatureForm'?: DeepPartial<Resources['Company.SignatureForm']>
  }
}

/**
 * Props for the {@link CompanyForms} management block.
 *
 * @alpha
 */
export interface CompanyFormsProps extends Omit<
  BaseComponentInterface<'Company.Management.CompanyForms'>,
  'dictionary'
> {
  /** The associated company identifier. */
  companyId: string
  /**
   * Identifier of the signatory using this block. Set it and each outstanding form offers a
   * Sign action; leave it unset and the document surface is review-only.
   */
  viewerSignatoryId?: string
  /** Translation overrides for this block and the document screens it opens. */
  dictionary?: CompanyFormsDictionary
}

/**
 * A company's required forms, as a self-contained card and document surface.
 *
 * @remarks
 * Opens on {@link CompanyFormsCard} and swaps to the document surface when its Manage action is
 * used, returning to the card via the "Back to company documents" header.
 *
 * Signing a form keeps the surface open — a company signs its forms one at a time — so the
 * "Documents signed" alert surfaces on the card once the user leaves. Changing the signatory
 * from the document list returns to that list rather than to the card.
 *
 * Signing requires knowing who is looking at the block. Pass `viewerSignatoryId` with the
 * identifier of the signatory using it and each outstanding form offers a Sign action. Leave it
 * unset and the surface is review-only: every form can be opened and the signatory can be
 * changed, but outstanding forms read as "Not signed" with no Sign action. Changing the
 * signatory does not lift this — signing stays bound to `viewerSignatoryId`, because inferring
 * it would treat anyone who opens the block as the signatory and let them sign the company's
 * federal tax forms.
 *
 * Use this when a single documents surface is wanted on its own.
 * `CompanyManagement.Dashboard` composes {@link CompanyFormsCard} directly instead, so that a
 * card's Manage action routes within the dashboard rather than opening a second, nested surface.
 *
 * Requires the `companySettingsDashboard` unstable feature flag; mounting it without the flag
 * throws.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/management/companyForms/editRequested` | The card's Manage action was used | `{ companyId: string }` |
 * | `company/forms/view` | A form was opened, raised by the list itself | {@link APIModels.Form} |
 * | `company/forms/editSignatory` | The signatory was opened for changing | The current signatory |
 * | `company/forms/sign/signForm` | A form was signed, raised by the signature form itself | {@link APIModels.Form} |
 * | `company/management/companyForms/updated` | A form was signed | The same form |
 * | `company/management/companyForms/editCancelled` | The surface was left via the back header | — |
 * | `company/management/companyForms/alertDismissed` | The success alert was dismissed | — |
 *
 * @param props - See {@link CompanyFormsProps}.
 * @returns The rendered company forms management block.
 * @alpha
 *
 * @example
 * ```tsx
 * import { CompanyManagement } from '@gusto/embedded-react-sdk'
 *
 * function MyComponent() {
 *   return (
 *     <CompanyManagement.CompanyForms
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       viewerSignatoryId="c1a2b3c4-5d6e-7f89-0a1b-2c3d4e5f6a7b"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function CompanyForms({
  companyId,
  viewerSignatoryId,
  onEvent,
  dictionary,
  FallbackComponent,
  LoaderComponent,
}: CompanyFormsProps) {
  useUnstableFeature('companySettingsDashboard', { throwIfDisabled: true })

  useI18n('Company.Management.CompanyForms')
  useComponentDictionary(
    'Company.Management.CompanyForms',
    pickNamespaceDictionary(dictionary, 'Company.Management.CompanyForms'),
  )
  // The document surface renders the list and the signature form, whose copy lives in their
  // own namespaces and is otherwise never loaded from this block.
  useI18n('Company.DocumentList')
  useComponentDictionary(
    'Company.DocumentList',
    pickNamespaceDictionary(dictionary, 'Company.DocumentList'),
  )
  useI18n('Company.SignatureForm')
  useComponentDictionary(
    'Company.SignatureForm',
    pickNamespaceDictionary(dictionary, 'Company.SignatureForm'),
  )

  const machine = useMemo(
    () =>
      createMachine(
        'card',
        companyFormsBlockStateMachine,
        (ctx: CompanyFormsBlockContextInterface) => ({
          ...ctx,
          component: CompanyFormsCardContextual,
          companyId,
          viewerSignatoryId,
          successAlert: null,
          pendingAlert: null,
          LoaderComponent,
        }),
      ),
    [companyId, viewerSignatoryId, LoaderComponent],
  )

  return (
    <BaseBoundaries
      componentName="Company.Management.CompanyForms"
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
    >
      <Flow machine={machine} onEvent={onEvent} />
    </BaseBoundaries>
  )
}
