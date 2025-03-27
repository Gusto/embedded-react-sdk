import { useTranslation } from 'react-i18next'
import { useSignatureForm } from './SignatureForm'
import { SignatureFormActions } from '@/components/Common/SignatureForm'

export function Actions() {
  const { handleBack, isPending } = useSignatureForm()
  const { t } = useTranslation('Employee.DocumentSigner')

  return (
    <SignatureFormActions
      onBack={handleBack}
      backLabel={t('backCta')}
      submitLabel={t('signFormCta')}
      isLoading={isPending}
    />
  )
}
