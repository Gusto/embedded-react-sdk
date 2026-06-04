import type { ComponentType } from 'react'
import { useHookFieldResolution } from '../useHookFieldResolution'
import { getFieldWithOptions } from '../getFieldWithOptions'
import type { BaseFieldProps, ValidationMessages, FormHookResult } from '../../types'
import { withFieldElementRegistry } from './withFieldElementRegistry'
import { RadioGroupField } from '@/components/Common'
import type { RadioGroupProps } from '@/components/Common/UI/RadioGroup/RadioGroupTypes'

/**
 * Props for {@link RadioGroupHookField}.
 *
 * @typeParam TErrorCode - Validation error code keys mapped via `validationMessages`.
 * @typeParam TEntry - Shape of each option entry consumed by `getOptionLabel`.
 * @public
 */
export interface RadioGroupHookFieldProps<
  TErrorCode extends string = never,
  TEntry = unknown,
> extends BaseFieldProps {
  name: string
  formHookResult?: FormHookResult
  validationMessages?: ValidationMessages<TErrorCode>
  getOptionLabel?: (entry: TEntry) => string
  FieldComponent?: ComponentType<RadioGroupProps>
}

/**
 * Radio group field connected to a partner form hook result via `useHookFieldResolution`.
 *
 * @typeParam TErrorCode - Validation error code keys mapped via `validationMessages`.
 * @typeParam TEntry - Shape of each option entry consumed by `getOptionLabel`.
 * @param props - Field configuration including `name`, `formHookResult`, and an optional `getOptionLabel`.
 * @returns The rendered radio group field wrapped in the field element registry.
 * @internal
 */
export function RadioGroupHookField<TErrorCode extends string, TEntry = unknown>({
  name,
  formHookResult,
  label,
  description,
  validationMessages,
  getOptionLabel,
  FieldComponent,
}: RadioGroupHookFieldProps<TErrorCode, TEntry>) {
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
    />,
  )
}
