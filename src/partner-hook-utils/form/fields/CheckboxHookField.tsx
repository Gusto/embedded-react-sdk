import type { ComponentType } from 'react'
import { useHookFieldResolution } from '../useHookFieldResolution'
import type { BaseFieldProps, ValidationMessages, FormHookResult } from '../../types'
import { withFieldElementRegistry } from './withFieldElementRegistry'
import { CheckboxField } from '@/components/Common'
import type { CheckboxProps } from '@/components/Common/UI/Checkbox/CheckboxTypes'

/**
 * Props for {@link CheckboxHookField}.
 *
 * @typeParam TErrorCode - Validation error code keys mapped via `validationMessages`.
 * @public
 */
export interface CheckboxHookFieldProps<TErrorCode extends string = never> extends BaseFieldProps {
  name: string
  formHookResult?: FormHookResult
  validationMessages?: ValidationMessages<TErrorCode>
  FieldComponent?: ComponentType<CheckboxProps>
}

/**
 * Checkbox field connected to a partner form hook result via `useHookFieldResolution`.
 *
 * @typeParam TErrorCode - Validation error code keys mapped via `validationMessages`.
 * @param props - Field configuration including `name`, `formHookResult`, and label content.
 * @returns The rendered checkbox field wrapped in the field element registry.
 * @internal
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
