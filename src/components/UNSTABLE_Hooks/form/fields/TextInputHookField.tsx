import type { ComponentType } from 'react'
import type { BaseFieldProps, ValidationMessages } from '../types'
import { useFieldsMetadata } from '../useFieldsMetadata'
import { useFieldErrorMessage } from '../useFieldErrorMessage'
import { TextInputField } from '@/components/Common'
import type { TextInputFieldProps } from '@/components/Common/Fields/TextInputField'

export interface TextInputHookFieldProps<TErrorCode extends string = never> extends BaseFieldProps {
  name: string
  validationMessages?: ValidationMessages<TErrorCode>
  FieldComponent?: ComponentType<TextInputFieldProps>
}

export function TextInputHookField<TErrorCode extends string>({
  name,
  label,
  description,
  validationMessages,
  FieldComponent = TextInputField,
}: TextInputHookFieldProps<TErrorCode>) {
  const metadata = useFieldsMetadata()
  const fieldMetadata = metadata[name]
  const errorMessage = useFieldErrorMessage(name, validationMessages)

  return (
    <FieldComponent
      name={name}
      label={label}
      description={description}
      errorMessage={errorMessage}
      isRequired={fieldMetadata?.isRequired}
      isDisabled={fieldMetadata?.isDisabled}
    />
  )
}
