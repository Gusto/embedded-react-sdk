import type { ComponentType } from 'react'
import { useHookFieldResolution } from '../useHookFieldResolution'
import type { BaseFieldProps, ValidationMessages, FormHookResult } from '../../types'
import { withFieldElementRegistry } from './withFieldElementRegistry'
import { NumberInputField } from '@/components/Common'
import type { NumberInputProps } from '@/components/Common/UI/NumberInput/NumberInputTypes'

/**
 * Props accepted by a number input field surfaced through a form hook.
 * Exposes numeric constraints (`min`, `max`), display `format`, `placeholder` text,
 * and `validationMessages` for custom error text alongside the shared base field
 * attributes (`label`, `description`).
 *
 * @typeParam TErrorCode - Validation error code keys mapped via `validationMessages`.
 * @public
 */
export interface NumberInputHookFieldProps<
  TErrorCode extends string = never,
> extends BaseFieldProps {
  /** The field name; must match the corresponding key in the form schema. */
  name: string
  /** Form hook result to connect to; falls back to the nearest `SDKFormProvider` when omitted. */
  formHookResult?: FormHookResult
  /** Display format for the number value (e.g. `'currency'`). */
  format?: NumberInputProps['format']
  /** Minimum allowed numeric value. */
  min?: NumberInputProps['min']
  /** Maximum allowed numeric value. */
  max?: NumberInputProps['max']
  /** Placeholder text displayed when the field has no value. */
  placeholder?: NumberInputProps['placeholder']
  /** Custom error text keyed by validation error code. */
  validationMessages?: ValidationMessages<TErrorCode>
  /** Replaces the default number input UI component; must accept the same props as `NumberInputProps`. */
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
