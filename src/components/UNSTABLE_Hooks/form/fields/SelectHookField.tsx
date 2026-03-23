import type { ComponentType } from 'react'
import type { BaseFieldProps, ValidationMessages } from '../types'
import { useFieldsMetadata } from '../useFieldsMetadata'
import { useFieldErrorMessage } from '../useFieldErrorMessage'
import { getFieldWithOptions } from '../getFieldWithOptions'
import { SelectField } from '@/components/Common'
import type { SelectFieldProps as BaseSelectFieldProps } from '@/components/Common/Fields/SelectField'

export interface SelectHookFieldProps<
  TErrorCode extends string = never,
  TEntry = unknown,
> extends BaseFieldProps {
  name: string
  validationMessages?: ValidationMessages<TErrorCode>
  getOptionLabel?: (entry: TEntry) => string
  FieldComponent?: ComponentType<BaseSelectFieldProps<string>>
}

export function SelectHookField<TErrorCode extends string, TEntry = unknown>({
  name,
  label,
  description,
  validationMessages,
  getOptionLabel,
  FieldComponent = SelectField,
}: SelectHookFieldProps<TErrorCode, TEntry>) {
  const metadata = useFieldsMetadata()
  const fieldMetadata = getFieldWithOptions<TEntry>(metadata, name)
  const errorMessage = useFieldErrorMessage(name, validationMessages)

  const defaultOptions = fieldMetadata?.options ?? []
  const options =
    getOptionLabel && fieldMetadata?.entries
      ? fieldMetadata.entries.map((entry, index) => ({
          value: defaultOptions[index]?.value ?? '',
          label: getOptionLabel(entry),
        }))
      : defaultOptions

  return (
    <FieldComponent
      name={name}
      label={label}
      description={description}
      errorMessage={errorMessage}
      isRequired={fieldMetadata?.isRequired}
      isDisabled={fieldMetadata?.isDisabled}
      options={options}
    />
  )
}
