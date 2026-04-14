import { useTranslation } from 'react-i18next'
import { TextInputField, CheckboxField } from '@/components/Common'

export function Form() {
  const { t } = useTranslation('Company.SignatureForm')

  return (
    <>
      <TextInputField
        name="signature"
        label={t('signatureLabel')}
        description={t('signatureDescription')}
        errorMessage={t('signatureError')}
        isRequired
      />
      <CheckboxField
        name="confirmSignature"
        isRequired
        label={t('confirmationLabel')}
        errorMessage={t('confirmationError')}
      />
    </>
  )
}
