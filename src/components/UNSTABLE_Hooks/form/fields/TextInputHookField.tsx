import type { ComponentType } from 'react'
import type { BaseFieldProps, ValidationMessages } from '../types'
import type { BaseFormHookReady } from '../../types'
import { useHookFieldResolution } from '../useHookFieldResolution'
import { TextInputField } from '@/components/Common'
import type { TextInputProps } from '@/components/Common/UI/TextInput/TextInputTypes'

export interface TextInputHookFieldProps<TErrorCode extends string = never> extends BaseFieldProps {
  name: string
  formHookResult?: BaseFormHookReady
  validationMessages?: ValidationMessages<TErrorCode>
  transform?: (value: string) => string
  placeholder?: string
  FieldComponent?: ComponentType<TextInputProps>
}

export function TextInputHookField<TErrorCode extends string>({
  name,
  formHookResult,
  label,
  description,
  validationMessages,
  transform,
  placeholder,
  FieldComponent,
}: TextInputHookFieldProps<TErrorCode>) {
  const { metadata, control, errorMessage } = useHookFieldResolution(
    name,
    formHookResult,
    validationMessages,
  )
  const fieldMetadata = metadata[name]

  return (
    <TextInputField
      name={name}
      control={control}
      label={label}
      description={description}
      errorMessage={errorMessage}
      isRequired={fieldMetadata?.isRequired}
      isDisabled={fieldMetadata?.isDisabled}
      transform={transform}
      placeholder={placeholder}
      FieldComponent={FieldComponent}
    />
  )
}
