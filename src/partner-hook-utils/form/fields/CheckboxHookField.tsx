import type { ComponentType } from 'react'
import { useHookFieldResolution } from '../useHookFieldResolution'
import type { BaseFieldProps, ValidationMessages, FormHookResult } from '../../types'
import { withFieldElementRegistry } from './withFieldElementRegistry'
import { CheckboxField } from '@/components/Common'
import type { CheckboxProps } from '@/components/Common/UI/Checkbox/CheckboxTypes'

/**
 * Props accepted by a checkbox field surfaced through a form hook.
 * Exposes `validationMessages` for custom error text alongside the shared base
 * field attributes (`label`, `description`).
 *
 * @typeParam TErrorCode - Validation error code keys mapped via `validationMessages`.
 * @public
 */
export interface CheckboxHookFieldProps<TErrorCode extends string = never> extends BaseFieldProps {
  /** The field name; must match the corresponding key in the form schema. */
  name: string
  /** Form hook result to connect to; falls back to the nearest `SDKFormProvider` when omitted. */
  formHookResult?: FormHookResult
  /** Custom error text keyed by validation error code. */
  validationMessages?: ValidationMessages<TErrorCode>
  /** Replaces the default checkbox UI component; must accept the same props as `CheckboxProps`. */
  FieldComponent?: ComponentType<CheckboxProps>
}

/**
 * Checkbox field connected to a partner form hook result via `useHookFieldResolution`.
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
 * @typeParam TErrorCode - Validation error code keys mapped via `validationMessages`.
 * @param props - Field configuration including `name`, `formHookResult`, and label content.
 * @returns The rendered checkbox field wrapped in the field element registry.
 * @public
 */
export function CheckboxHookField<TErrorCode extends string>({
  name,
  formHookResult,
  label,
  description,
  validationMessages,
  FieldComponent,
}: CheckboxHookFieldProps<TErrorCode>) {
  const { metadata, control, errorMessage, fieldElementRegistry } = useHookFieldResolution(
    name,
    formHookResult,
    validationMessages,
  )
  const fieldMetadata = metadata[name]

  return withFieldElementRegistry(
    fieldElementRegistry,
    <CheckboxField
      name={name}
      control={control}
      label={label}
      description={description}
      errorMessage={errorMessage}
      isRequired={fieldMetadata?.isRequired}
      isDisabled={fieldMetadata?.isDisabled}
      FieldComponent={FieldComponent}
    />,
  )
}
