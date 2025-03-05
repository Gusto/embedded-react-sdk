import { useFormContext } from 'react-hook-form'
import type { SignatureFormInputs } from './SignatureForm'
import { TextField, CheckboxGroup } from '@/components/Common'

interface SignatureFormFieldsProps {
  signatureLabel: string
  signatureDescription?: string
  signatureError?: string
  confirmationGroupLabel: string
  confirmationLabel: string
  confirmationError?: string
}

export function SignatureFormFields({
  signatureLabel,
  signatureDescription = '',
  signatureError = '',
  confirmationGroupLabel,
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
        aria-label={confirmationGroupLabel}
        errorMessage={confirmationError}
        options={[{ name: 'agree', label: confirmationLabel }]}
      />
    </>
  )
}
