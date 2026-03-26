import type { ComponentType } from 'react'
import type { BaseFieldProps, ValidationMessages } from '../types'
import type { BaseFormHookReady } from '../../types'
import { useHookFieldResolution } from '../useHookFieldResolution'
import { DatePickerField } from '@/components/Common/Fields/DatePickerField'
import type { DatePickerProps } from '@/components/Common/UI/DatePicker/DatePickerTypes'

export interface DatePickerHookFieldProps<
  TErrorCode extends string = never,
> extends BaseFieldProps {
  name: string
  formHookResult?: BaseFormHookReady
  validationMessages?: ValidationMessages<TErrorCode>
  FieldComponent?: ComponentType<DatePickerProps>
}

export function DatePickerHookField<TErrorCode extends string>({
  name,
  formHookResult,
  label,
  description,
  validationMessages,
  FieldComponent,
}: DatePickerHookFieldProps<TErrorCode>) {
  const { metadata, control, errorMessage } = useHookFieldResolution(
    name,
    formHookResult,
    validationMessages,
  )
  const fieldMetadata = metadata[name]

  return (
    <DatePickerField
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
