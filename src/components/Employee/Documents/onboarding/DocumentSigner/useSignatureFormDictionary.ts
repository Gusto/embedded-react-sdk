import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { SignatureFormDictionary } from '../../shared/SignatureForm/SignatureForm'
import { useI18n } from '@/i18n'

/**
 * Resolves the shared `SignatureForm`'s text against onboarding's existing
 * `Employee.DocumentSigner` namespace. The shared form's keys already match
 * onboarding's historical key names, so this is an identity mapping that keeps
 * partner overrides on `Employee.DocumentSigner` flowing into the form text
 * through the onboarding flow's `dictionary` prop.
 */
export function useOnboardingSignatureFormDictionary(): SignatureFormDictionary {
  useI18n('Employee.DocumentSigner')
  const { t } = useTranslation('Employee.DocumentSigner')

  return useMemo<SignatureFormDictionary>(
    () => ({
      en: {
        signatureFormTitle: t('signatureFormTitle'),
        downloadPrompt: t('downloadPrompt'),
        signatureFieldLabel: t('signatureFieldLabel'),
        signatureFieldDescription: t('signatureFieldDescription'),
        signatureFieldError: t('signatureFieldError'),
        confirmSignatureCheckboxLabel: t('confirmSignatureCheckboxLabel'),
        confirmSignatureError: t('confirmSignatureError'),
        backCta: t('backCta'),
        signFormCta: t('signFormCta'),
        viewDocumentCta: t('viewDocumentCta'),
        downloadAndReviewInstructions: t('downloadAndReviewInstructions'),
      },
    }),
    [t],
  )
}
