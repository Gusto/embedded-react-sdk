import { useTranslation } from 'react-i18next'
import { useSignatureForm } from './useSignatureForm'
import { SignatureFormActions } from '@/components/Common/SignatureForm'

export function Actions() {
  const { handleBack, isPending } = useSignatureForm()
  const { t } = useTranslation('Contractor.DocumentSigner')

  return (
    <SignatureFormActions
      onBack={handleBack}
      backLabel={t('backCta')}
      submitLabel={t('signFormCta')}
      isLoading={isPending}
    />
  )
}
