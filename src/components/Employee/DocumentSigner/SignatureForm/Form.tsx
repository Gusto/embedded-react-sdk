import { useTranslation } from 'react-i18next'
import { SignatureFormFields } from '@/components/Common/SignatureForm'

export function Form() {
  const { t } = useTranslation('Employee.DocumentSigner')
  return (
    <SignatureFormFields
      signatureLabel="Signature"
      signatureDescription={t('signatureFieldDescription')}
      signatureError={t('signatureFieldError')}
      confirmationGroupLabel={t('confirmationGroupLabel')}
      confirmationLabel={t('confirmSignatureCheckboxLabel')}
      confirmationError={t('confirmSignatureError')}
    />
  )
}
