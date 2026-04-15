import { useTranslation } from 'react-i18next'
import { TextInputField, CheckboxField } from '@/components/Common'

export function Form() {
  const { t } = useTranslation('Employee.DocumentSigner')

  return (
    <>
      <TextInputField
        name="signature"
        label={t('signatureFieldLabel')}
        description={t('signatureFieldDescription')}
        errorMessage={t('signatureFieldError')}
        isRequired
      />
      <CheckboxField
        name="confirmSignature"
        isRequired
        label={t('confirmSignatureCheckboxLabel')}
        errorMessage={t('confirmSignatureError')}
      />
    </>
  )
}
