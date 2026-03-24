import type { ComponentType } from 'react'
import type { BaseFieldProps, ValidationMessages } from '../types'
import { useFieldsMetadata } from '../useFieldsMetadata'
import { useFieldErrorMessage } from '../useFieldErrorMessage'
import { DatePickerField } from '@/components/Common/Fields/DatePickerField'
import type { DatePickerProps } from '@/components/Common/UI/DatePicker/DatePickerTypes'

export interface DatePickerHookFieldProps<
  TErrorCode extends string = never,
> extends BaseFieldProps {
  name: string
  validationMessages?: ValidationMessages<TErrorCode>
  FieldComponent?: ComponentType<DatePickerProps>
}

export function DatePickerHookField<TErrorCode extends string>({
  name,
  label,
  description,
  validationMessages,
  FieldComponent,
}: DatePickerHookFieldProps<TErrorCode>) {
  const metadata = useFieldsMetadata()
  const fieldMetadata = metadata[name]
  const errorMessage = useFieldErrorMessage(name, validationMessages)

  return (
    <DatePickerField
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
