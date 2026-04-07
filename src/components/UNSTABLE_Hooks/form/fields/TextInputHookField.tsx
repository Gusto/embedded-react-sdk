import type { ComponentType } from 'react'
import { useHookFieldResolution } from '../useHookFieldResolution'
import type { BaseFieldProps, ValidationMessages } from '@/types/sdkHooks'
import type { BaseFormHookReady } from '@/types/sdkHooks'
import { TextInputField } from '@/components/Common'
import type { TextInputProps } from '@/components/Common/UI/TextInput/TextInputTypes'

export interface TextInputHookFieldProps<
  TErrorCode extends string = never,
  TOptionalErrorCode extends string = never,
> extends BaseFieldProps {
  name: string
  formHookResult?: BaseFormHookReady
  validationMessages?: ValidationMessages<TErrorCode, TOptionalErrorCode>
  transform?: (value: string) => string
  placeholder?: string
  FieldComponent?: ComponentType<TextInputProps>
}

export function TextInputHookField<
  TErrorCode extends string,
  TOptionalErrorCode extends string = never,
>({
  name,
  formHookResult,
  label,
  description,
  validationMessages,
  transform,
  placeholder,
  FieldComponent,
}: TextInputHookFieldProps<TErrorCode, TOptionalErrorCode>) {
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
