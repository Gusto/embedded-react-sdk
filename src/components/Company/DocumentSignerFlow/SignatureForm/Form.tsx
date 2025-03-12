import { useTranslation } from 'react-i18next'
import { SignatureFormFields } from '@/components/Common/SignatureForm'

export function Form() {
  const { t } = useTranslation('Company.SignatureForm')

  return (
    <SignatureFormFields
      signatureLabel={t('signatureLabel')}
      signatureDescription={t('signatureDescription')}
      signatureError={t('signatureError')}
      confirmationGroupLabel={t('confirmationGroupLabel')}
      confirmationLabel={t('confirmationLabel')}
      confirmationError={t('confirmationError')}
    />
  )
}
