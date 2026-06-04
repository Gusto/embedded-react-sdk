import type { ComponentType } from 'react'
import { useHookFieldResolution } from '../useHookFieldResolution'
import type { BaseFieldProps, ValidationMessages, FormHookResult } from '../../types'
import { withFieldElementRegistry } from './withFieldElementRegistry'
import { NumberInputField } from '@/components/Common'
import type { NumberInputProps } from '@/components/Common/UI/NumberInput/NumberInputTypes'

/**
 * Props for {@link NumberInputHookField}.
 *
 * @typeParam TErrorCode - Validation error code keys mapped via `validationMessages`.
 * @public
 */
export interface NumberInputHookFieldProps<
  TErrorCode extends string = never,
> extends BaseFieldProps {
  name: string
  formHookResult?: FormHookResult
  format?: NumberInputProps['format']
  min?: NumberInputProps['min']
  max?: NumberInputProps['max']
  placeholder?: NumberInputProps['placeholder']
  validationMessages?: ValidationMessages<TErrorCode>
  FieldComponent?: ComponentType<NumberInputProps>
}

/**
 * Number input field connected to a partner form hook result via `useHookFieldResolution`.
 *
 * @typeParam TErrorCode - Validation error code keys mapped via `validationMessages`.
 * @param props - Field configuration including `name`, `formHookResult`, formatting, and numeric bounds.
 * @returns The rendered number input field wrapped in the field element registry.
 * @internal
 */
export function NumberInputHookField<TErrorCode extends string>({
  name,
  formHookResult,
  label,
  description,
  format,
  min,
  max,
  placeholder,
  validationMessages,
  FieldComponent,
}: NumberInputHookFieldProps<TErrorCode>) {
  const { metadata, control, errorMessage, fieldElementRegistry } = useHookFieldResolution(
    name,
    formHookResult,
    validationMessages,
  )
  const fieldMetadata = metadata[name]

  return withFieldElementRegistry(
    fieldElementRegistry,
    <NumberInputField
      name={name}
      control={control}
      label={label}
      description={description}
      errorMessage={errorMessage}
      isRequired={fieldMetadata?.isRequired}
      isDisabled={fieldMetadata?.isDisabled}
      format={format}
      min={min}
      max={max}
      placeholder={placeholder}
      FieldComponent={FieldComponent}
    />,
  )
}
