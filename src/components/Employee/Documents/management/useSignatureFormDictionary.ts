import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { SignatureFormDictionary } from '../shared/SignatureForm/SignatureForm'

/**
 * Resolves the shared `SignatureForm`'s text against management's
 * `Employee.Management.Documents` namespace. All signature copy is owned by
 * management's translation file under the nested `signatureForm.*` shape, so
 * partner overrides on `Employee.Management.Documents` flow into the form text
 * independently of the onboarding flow.
 */
export function useManagementSignatureFormDictionary(): SignatureFormDictionary {
  const { t } = useTranslation('Employee.Management.Documents')

  return useMemo<SignatureFormDictionary>(
    () => ({
      en: {
        signatureFormTitle: t('signatureForm.signatureFormTitle'),
        downloadPrompt: t('signatureForm.downloadPrompt'),
        signatureFieldLabel: t('signatureForm.signatureFieldLabel'),
        signatureFieldDescription: t('signatureForm.signatureFieldDescription'),
        signatureFieldError: t('signatureForm.signatureFieldError'),
        confirmSignatureCheckboxLabel: t('signatureForm.confirmSignatureCheckboxLabel'),
        confirmSignatureError: t('signatureForm.confirmSignatureError'),
        backCta: t('signatureForm.backCta'),
        signFormCta: t('signatureForm.signFormCta'),
        viewDocumentCta: t('signatureForm.viewDocumentCta'),
        downloadAndReviewInstructions: t('signatureForm.downloadAndReviewInstructions'),
      },
    }),
    [t],
  )
}
