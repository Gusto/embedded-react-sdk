import type { BaseFieldProps, ValidationMessages } from '../types'
import { useFieldsMetadata } from '../useFieldsMetadata'
import { useFieldErrorMessage } from '../useFieldErrorMessage'
import { SwitchField } from '@/components/Common'

export interface SwitchHookFieldProps<TErrorCode extends string = never> extends BaseFieldProps {
  name: string
  validationMessages?: ValidationMessages<TErrorCode>
}

export function SwitchHookField<TErrorCode extends string>({
  name,
  label,
  description,
  validationMessages,
}: SwitchHookFieldProps<TErrorCode>) {
  const metadata = useFieldsMetadata()
  const fieldMetadata = metadata[name]
  const errorMessage = useFieldErrorMessage(name, validationMessages)

  return (
    <SwitchField
      name={name}
      label={label}
      description={description}
      errorMessage={errorMessage}
      isRequired={fieldMetadata?.isRequired}
      isDisabled={fieldMetadata?.isDisabled}
    />
  )
}
