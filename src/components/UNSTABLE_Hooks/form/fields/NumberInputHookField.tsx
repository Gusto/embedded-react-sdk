import type { ComponentType } from 'react'
import type { BaseFieldProps, ValidationMessages } from '../types'
import { useFieldsMetadata } from '../useFieldsMetadata'
import { useFieldErrorMessage } from '../useFieldErrorMessage'
import { NumberInputField } from '@/components/Common'
import type { NumberInputFieldProps } from '@/components/Common/Fields/NumberInputField'
import type { NumberInputProps } from '@/components/Common/UI/NumberInput/NumberInputTypes'

export interface NumberInputHookFieldProps<
  TErrorCode extends string = never,
> extends BaseFieldProps {
  name: string
  format?: NumberInputProps['format']
  min?: NumberInputProps['min']
  max?: NumberInputProps['max']
  validationMessages?: ValidationMessages<TErrorCode>
  FieldComponent?: ComponentType<NumberInputFieldProps>
}

export function NumberInputHookField<TErrorCode extends string>({
  name,
  label,
  description,
  format,
  min,
  max,
  validationMessages,
  FieldComponent = NumberInputField,
}: NumberInputHookFieldProps<TErrorCode>) {
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
      format={format}
      min={min}
      max={max}
    />
  )
}
