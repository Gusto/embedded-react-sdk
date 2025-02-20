import { useTranslation } from 'react-i18next'
import { SignatureFormActions } from '@/components/Common/SignatureForm'
import { useSignatureForm } from './SignatureForm'

export function Actions() {
  const { onBack, isPending } = useSignatureForm()
  const { t } = useTranslation('Company.SignatureForm')

  return (
    <SignatureFormActions
      onBack={onBack}
      backLabel={t('backCta')}
      submitLabel={t('submitCta')}
      isLoading={isPending}
    />
  )
}
