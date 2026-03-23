import type { ComponentProps, ComponentType } from 'react'
import type { BaseFieldProps, ValidationMessages } from '../types'
import { useFieldsMetadata } from '../useFieldsMetadata'
import { useFieldErrorMessage } from '../useFieldErrorMessage'
import { DatePickerField } from '@/components/Common/Fields/DatePickerField'

type DatePickerFieldProps = ComponentProps<typeof DatePickerField>

export interface DatePickerHookFieldProps<
  TErrorCode extends string = never,
> extends BaseFieldProps {
  name: string
  validationMessages?: ValidationMessages<TErrorCode>
  FieldComponent?: ComponentType<DatePickerFieldProps>
}

export function DatePickerHookField<TErrorCode extends string>({
  name,
  label,
  description,
  validationMessages,
  FieldComponent = DatePickerField,
}: DatePickerHookFieldProps<TErrorCode>) {
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
