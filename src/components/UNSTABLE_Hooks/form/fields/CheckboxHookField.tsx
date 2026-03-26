import type { ComponentType } from 'react'
import type { BaseFieldProps, FormHookResultLike, ValidationMessages } from '../types'
import { useHookFieldResolution } from '../useHookFieldResolution'
import { CheckboxField } from '@/components/Common'
import type { CheckboxProps } from '@/components/Common/UI/Checkbox/CheckboxTypes'

export interface CheckboxHookFieldProps<TErrorCode extends string = never> extends BaseFieldProps {
  name: string
  formHookResult?: FormHookResultLike
  validationMessages?: ValidationMessages<TErrorCode>
  FieldComponent?: ComponentType<CheckboxProps>
}

export function CheckboxHookField<TErrorCode extends string>({
  name,
  formHookResult,
  label,
  description,
  validationMessages,
  FieldComponent,
}: CheckboxHookFieldProps<TErrorCode>) {
  const { metadata, control, errorMessage } = useHookFieldResolution(
    name,
    formHookResult,
    validationMessages,
  )
  const fieldMetadata = metadata[name]

  return (
    <CheckboxField
      name={name}
      control={control}
      label={label}
      description={description}
      errorMessage={errorMessage}
      isRequired={fieldMetadata?.isRequired}
      isDisabled={fieldMetadata?.isDisabled}
      FieldComponent={FieldComponent}
    />
  )
}
