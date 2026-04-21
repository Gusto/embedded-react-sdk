import type { ComponentType } from 'react'
import { useHookFieldResolution } from '../useHookFieldResolution'
import type { BaseFieldProps, ValidationMessages, FormHookResult } from '../../types'
import { DatePickerField } from '@/components/Common/Fields/DatePickerField'
import type { DatePickerProps } from '@/components/Common/UI/DatePicker/DatePickerTypes'

export interface DatePickerHookFieldProps<TErrorCode extends string = never>
  extends BaseFieldProps, Pick<DatePickerProps, 'portalContainer'> {
  name: string
  formHookResult?: FormHookResult
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
  portalContainer,
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
      portalContainer={portalContainer}
    />
  )
}
