import { useFormContext } from 'react-hook-form'
import { TextField, CheckboxGroup } from '@/components/Common'
import type { SignatureFormInputs } from './SignatureForm'

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
  const { control } = useFormContext<SignatureFormInputs>()

  return (
    <>
      <TextField
        name="signature"
        label={signatureLabel}
        control={control}
        description={signatureDescription}
        errorMessage={signatureError}
        isRequired
      />
      <CheckboxGroup
        control={control}
        name="confirmSignature"
        isRequired
        aria-label={confirmationLabel}
        errorMessage={confirmationError}
        options={[{ name: 'agree', label: confirmationLabel }]}
      />
    </>
  )
}
