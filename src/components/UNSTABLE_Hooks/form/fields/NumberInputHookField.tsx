import type { ComponentType } from 'react'
import type { BaseFieldProps, ValidationMessages } from '../types'
import type { BaseFormHookReady } from '../../types'
import { useHookFieldResolution } from '../useHookFieldResolution'
import { NumberInputField } from '@/components/Common'
import type { NumberInputProps } from '@/components/Common/UI/NumberInput/NumberInputTypes'

export interface NumberInputHookFieldProps<
  TErrorCode extends string = never,
> extends BaseFieldProps {
  name: string
  formHookResult?: BaseFormHookReady
  format?: NumberInputProps['format']
  min?: NumberInputProps['min']
  max?: NumberInputProps['max']
  validationMessages?: ValidationMessages<TErrorCode>
  FieldComponent?: ComponentType<NumberInputProps>
}

export function NumberInputHookField<TErrorCode extends string>({
  name,
  formHookResult,
  label,
  description,
  format,
  min,
  max,
  validationMessages,
  FieldComponent,
}: NumberInputHookFieldProps<TErrorCode>) {
  const { metadata, control, errorMessage } = useHookFieldResolution(
    name,
    formHookResult,
    validationMessages,
  )
  const fieldMetadata = metadata[name]

  return (
    <NumberInputField
      name={name}
      control={control}
      label={label}
      description={description}
      errorMessage={errorMessage}
      isRequired={fieldMetadata?.isRequired}
      isDisabled={fieldMetadata?.isDisabled}
      format={format}
      min={min}
      max={max}
      FieldComponent={FieldComponent}
    />
  )
}
