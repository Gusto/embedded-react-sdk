import type { ComponentType } from 'react'
import { useHookFieldResolution } from '../useHookFieldResolution'
import type { BaseFieldProps, ValidationMessages, FormHookResult } from '../../types'
import { withFieldElementRegistry } from './withFieldElementRegistry'
import { TextInputField } from '@/components/Common'
import type { TextInputProps } from '@/components/Common/UI/TextInput/TextInputTypes'

/**
 * Props accepted by a text input field surfaced through a form hook.
 * Exposes a `transform` function for preprocessing raw input, `placeholder` text,
 * and `validationMessages` for custom error text alongside the shared base field
 * attributes (`label`, `description`).
 *
 * @typeParam TErrorCode - Required validation error code keys mapped via `validationMessages`.
 * @typeParam TOptionalErrorCode - Optional validation error code keys mapped via `validationMessages`.
 * @public
 */
export interface TextInputHookFieldProps<
  TErrorCode extends string = never,
  TOptionalErrorCode extends string = never,
> extends BaseFieldProps {
  /** The field name; must match the corresponding key in the form schema. */
  name: string
  /** Form hook result to connect to; falls back to the nearest `SDKFormProvider` when omitted. */
  formHookResult?: FormHookResult
  /** Custom error text keyed by validation error code. */
  validationMessages?: ValidationMessages<TErrorCode, TOptionalErrorCode>
  /** Transforms the raw string value on every change before storing it; use for normalization such as trimming or changing case. */
  transform?: (value: string) => string
  /** Placeholder text displayed when the field has no value. */
  placeholder?: string
  /** Replaces the default text input UI component; must accept the same props as `TextInputProps`. */
  FieldComponent?: ComponentType<TextInputProps>
}

/**
 * Text input field connected to a partner form hook result via `useHookFieldResolution`.
 *
 * @remarks
 * Use inside a form hook's `FormProvider` when you need a custom layout instead of the
 * hook's pre-built `Fields`. Connect to a specific hook result via `formHookResult`, or
 * omit it to read from the nearest {@link SDKFormProvider}.
 *
 * Field metadata (required state, disabled state) is resolved automatically from the
 * hook result. Validation errors are surfaced in the same order as the built-in fields:
 * client-side Zod errors first, then server-side errors.
 *
 * @typeParam TErrorCode - Required validation error code keys mapped via `validationMessages`.
 * @typeParam TOptionalErrorCode - Optional validation error code keys mapped via `validationMessages`.
 * @param props - Field configuration including `name`, `formHookResult`, `transform`, `placeholder`, and label content.
 * @returns The rendered text input field wrapped in the field element registry.
 * @public
 */
export function TextInputHookField<
  TErrorCode extends string,
  TOptionalErrorCode extends string = never,
>({
  name,
  formHookResult,
  label,
  description,
  validationMessages,
  transform,
  placeholder,
  FieldComponent,
}: TextInputHookFieldProps<TErrorCode, TOptionalErrorCode>) {
  const { metadata, control, errorMessage, fieldElementRegistry } = useHookFieldResolution(
    name,
    formHookResult,
    validationMessages,
  )
  const fieldMetadata = metadata[name]

  return withFieldElementRegistry(
    fieldElementRegistry,
    <TextInputField
      name={name}
      control={control}
      label={label}
      description={description}
      errorMessage={errorMessage}
      isRequired={fieldMetadata?.isRequired}
      isDisabled={fieldMetadata?.isDisabled}
      transform={transform}
      placeholder={placeholder}
      FieldComponent={FieldComponent}
    />,
  )
}
