import type { ComponentType } from 'react'
import type { BaseFieldProps, ValidationMessages } from '../types'
import { useFieldsMetadata } from '../useFieldsMetadata'
import { useFieldErrorMessage } from '../useFieldErrorMessage'
import { SwitchField } from '@/components/Common'
import type { SwitchProps } from '@/components/Common/UI/Switch/SwitchTypes'

export interface SwitchHookFieldProps<TErrorCode extends string = never> extends BaseFieldProps {
  name: string
  validationMessages?: ValidationMessages<TErrorCode>
  FieldComponent?: ComponentType<SwitchProps>
}

export function SwitchHookField<TErrorCode extends string>({
  name,
  label,
  description,
  validationMessages,
  FieldComponent,
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
      FieldComponent={FieldComponent}
    />
  )
}
