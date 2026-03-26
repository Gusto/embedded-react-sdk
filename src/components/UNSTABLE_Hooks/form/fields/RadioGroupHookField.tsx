import type { ComponentType } from 'react'
import type { BaseFieldProps, FormHookResultLike, ValidationMessages } from '../types'
import { useHookFieldResolution } from '../useHookFieldResolution'
import { getFieldWithOptions } from '../getFieldWithOptions'
import { RadioGroupField } from '@/components/Common'
import type { RadioGroupProps } from '@/components/Common/UI/RadioGroup/RadioGroupTypes'

export interface RadioGroupHookFieldProps<
  TErrorCode extends string = never,
  TEntry = unknown,
> extends BaseFieldProps {
  name: string
  formHookResult?: FormHookResultLike
  validationMessages?: ValidationMessages<TErrorCode>
  getOptionLabel?: (entry: TEntry) => string
  FieldComponent?: ComponentType<RadioGroupProps>
}

export function RadioGroupHookField<TErrorCode extends string, TEntry = unknown>({
  name,
  formHookResult,
  label,
  description,
  validationMessages,
  getOptionLabel,
  FieldComponent,
}: RadioGroupHookFieldProps<TErrorCode, TEntry>) {
  const { metadata, control, errorMessage } = useHookFieldResolution(
    name,
    formHookResult,
    validationMessages,
  )
  const fieldMetadata = getFieldWithOptions<TEntry>(metadata, name)

  const defaultOptions = fieldMetadata?.options ?? []
  const options =
    getOptionLabel && fieldMetadata?.entries
      ? fieldMetadata.entries.map((entry, index) => ({
          value: defaultOptions[index]?.value ?? '',
          label: getOptionLabel(entry),
        }))
      : defaultOptions

  return (
    <RadioGroupField
      name={name}
      control={control}
      label={label}
      description={description}
      errorMessage={errorMessage}
      isRequired={fieldMetadata?.isRequired}
      isDisabled={fieldMetadata?.isDisabled}
      options={options}
      FieldComponent={FieldComponent}
    />
  )
}
