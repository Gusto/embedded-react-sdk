import { TextInputField, CheckboxField } from '@/components/Common'

interface SignatureFormFieldsProps {
  signatureLabel: string
  signatureDescription?: string
  signatureError?: string
  confirmationLabel: string
  confirmationError?: string
}

export function SignatureFormFields({
  signatureLabel,
  signatureDescription = '',
  signatureError = '',
  confirmationLabel,
  confirmationError = '',
}: SignatureFormFieldsProps) {
  return (
    <>
      <TextInputField
        name="signature"
        label={signatureLabel}
        description={signatureDescription}
        errorMessage={signatureError}
        isRequired
      />
      <CheckboxField
        name="confirmSignature"
        isRequired
        label={confirmationLabel}
        errorMessage={confirmationError}
      />
    </>
  )
}
