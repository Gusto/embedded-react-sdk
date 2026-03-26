import type { ComponentType } from 'react'
import type { BaseFieldProps, FormHookResultLike, ValidationMessages } from '../types'
import { useHookFieldResolution } from '../useHookFieldResolution'
import { SwitchField } from '@/components/Common'
import type { SwitchProps } from '@/components/Common/UI/Switch/SwitchTypes'

export interface SwitchHookFieldProps<TErrorCode extends string = never> extends BaseFieldProps {
  name: string
  formHookResult?: FormHookResultLike
  validationMessages?: ValidationMessages<TErrorCode>
  FieldComponent?: ComponentType<SwitchProps>
}

export function SwitchHookField<TErrorCode extends string>({
  name,
  formHookResult,
  label,
  description,
  validationMessages,
  FieldComponent,
}: SwitchHookFieldProps<TErrorCode>) {
  const { metadata, control, errorMessage } = useHookFieldResolution(
    name,
    formHookResult,
    validationMessages,
  )
  const fieldMetadata = metadata[name]

  return (
    <SwitchField
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
