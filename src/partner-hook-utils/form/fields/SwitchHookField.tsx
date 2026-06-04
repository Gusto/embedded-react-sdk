import type { ComponentType } from 'react'
import { useHookFieldResolution } from '../useHookFieldResolution'
import type { BaseFieldProps, ValidationMessages, FormHookResult } from '../../types'
import { withFieldElementRegistry } from './withFieldElementRegistry'
import { SwitchField } from '@/components/Common'
import type { SwitchProps } from '@/components/Common/UI/Switch/SwitchTypes'

/**
 * Props for {@link SwitchHookField}.
 *
 * @typeParam TErrorCode - Validation error code keys mapped via `validationMessages`.
 * @public
 */
export interface SwitchHookFieldProps<TErrorCode extends string = never> extends BaseFieldProps {
  name: string
  formHookResult?: FormHookResult
  validationMessages?: ValidationMessages<TErrorCode>
  FieldComponent?: ComponentType<SwitchProps>
}

/**
 * Switch field connected to a partner form hook result via `useHookFieldResolution`.
 *
 * @typeParam TErrorCode - Validation error code keys mapped via `validationMessages`.
 * @param props - Field configuration including `name`, `formHookResult`, and label content.
 * @returns The rendered switch field wrapped in the field element registry.
 * @internal
 */
export function SwitchHookField<TErrorCode extends string>({
  name,
  formHookResult,
  label,
  description,
  validationMessages,
  FieldComponent,
}: SwitchHookFieldProps<TErrorCode>) {
  const { metadata, control, errorMessage, fieldElementRegistry } = useHookFieldResolution(
    name,
    formHookResult,
    validationMessages,
  )
  const fieldMetadata = metadata[name]

  return withFieldElementRegistry(
    fieldElementRegistry,
    <SwitchField
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
