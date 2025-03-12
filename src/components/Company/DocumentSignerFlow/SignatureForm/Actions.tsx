import { useTranslation } from 'react-i18next'
import { useSignatureForm } from './SignatureForm'
import { SignatureFormActions } from '@/components/Common/SignatureForm'

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
