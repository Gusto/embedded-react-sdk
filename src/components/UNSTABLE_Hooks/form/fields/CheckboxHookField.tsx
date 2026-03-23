import type { ComponentType } from 'react'
import type { BaseFieldProps, ValidationMessages } from '../types'
import { useFieldsMetadata } from '../useFieldsMetadata'
import { useFieldErrorMessage } from '../useFieldErrorMessage'
import { CheckboxField } from '@/components/Common'
import type { CheckboxFieldProps } from '@/components/Common/Fields/CheckboxField'

export interface CheckboxHookFieldProps<TErrorCode extends string = never> extends BaseFieldProps {
  name: string
  validationMessages?: ValidationMessages<TErrorCode>
  FieldComponent?: ComponentType<CheckboxFieldProps>
}

export function CheckboxHookField<TErrorCode extends string>({
  name,
  label,
  description,
  validationMessages,
  FieldComponent = CheckboxField,
}: CheckboxHookFieldProps<TErrorCode>) {
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
