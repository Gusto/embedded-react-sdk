import type { ComponentType } from 'react'
import { useHookFieldResolution } from '../useHookFieldResolution'
import { getFieldWithOptions } from '../getFieldWithOptions'
import type { BaseFieldProps, ValidationMessages, FormHookResult } from '../../types'
import { withFieldElementRegistry } from './withFieldElementRegistry'
import { SelectField } from '@/components/Common'
import type { SelectProps } from '@/components/Common/UI/Select/SelectTypes'

/**
 * Props for {@link SelectHookField}.
 *
 * @typeParam TErrorCode - Validation error code keys mapped via `validationMessages`.
 * @typeParam TEntry - Shape of each option entry consumed by `getOptionLabel`.
 * @public
 */
export interface SelectHookFieldProps<TErrorCode extends string = never, TEntry = unknown>
  extends BaseFieldProps, Pick<SelectProps, 'portalContainer'> {
  name: string
  formHookResult?: FormHookResult
  validationMessages?: ValidationMessages<TErrorCode>
  getOptionLabel?: (entry: TEntry) => string
  placeholder?: string
  FieldComponent?: ComponentType<SelectProps>
  /** When used inside a modal, pass the modal backdrop ref’s element so the listbox stacks correctly. */
  portalContainer?: SelectProps['portalContainer']
}

/**
 * Select field connected to a partner form hook result via `useHookFieldResolution`.
 *
 * @typeParam TErrorCode - Validation error code keys mapped via `validationMessages`.
 * @typeParam TEntry - Shape of each option entry consumed by `getOptionLabel`.
 * @param props - Field configuration including `name`, `formHookResult`, and an optional `getOptionLabel`.
 * @returns The rendered select field wrapped in the field element registry.
 * @internal
 */
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
  const { metadata, control, errorMessage, fieldElementRegistry } = useHookFieldResolution(
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

  return withFieldElementRegistry(
    fieldElementRegistry,
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
    />,
  )
}
