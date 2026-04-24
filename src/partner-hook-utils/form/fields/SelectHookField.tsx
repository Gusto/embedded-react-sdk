import type { ComponentType } from 'react'
import { useHookFieldResolution } from '../useHookFieldResolution'
import { getFieldWithOptions } from '../getFieldWithOptions'
import type { BaseFieldProps, ValidationMessages, FormHookResult } from '../../types'
import { SelectField } from '@/components/Common'
import type { SelectProps } from '@/components/Common/UI/Select/SelectTypes'

export interface SelectHookFieldProps<
  TErrorCode extends string = never,
  TEntry = unknown,
> extends BaseFieldProps {
  name: string
  formHookResult?: FormHookResult
  validationMessages?: ValidationMessages<TErrorCode>
  getOptionLabel?: (entry: TEntry) => string
  placeholder?: string
  FieldComponent?: ComponentType<SelectProps>
  /** When used inside a modal, pass the modal backdrop ref’s element so the listbox stacks correctly. */
  portalContainer?: SelectProps['portalContainer']
}

export function SelectHookField<TErrorCode extends string, TEntry = unknown>({
  name,
  formHookResult,
  label,
  description,
  validationMessages,
  getOptionLabel,
  placeholder,
  FieldComponent,
  portalContainer,
}: SelectHookFieldProps<TErrorCode, TEntry>) {
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
    <SelectField
      name={name}
      control={control}
      label={label}
      description={description}
      errorMessage={errorMessage}
      isRequired={fieldMetadata?.isRequired}
      isDisabled={fieldMetadata?.isDisabled}
      options={options}
      placeholder={placeholder}
      FieldComponent={FieldComponent}
      portalContainer={portalContainer}
    />
  )
}
