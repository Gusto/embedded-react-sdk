import type { ComponentType } from 'react'
import { useHookFieldResolution } from '../useHookFieldResolution'
import type { BaseFieldProps, ValidationMessages, FormHookResult } from '../../types'
import { withFieldElementRegistry } from './withFieldElementRegistry'
import { TextInputField } from '@/components/Common'
import type { TextInputProps } from '@/components/Common/UI/TextInput/TextInputTypes'

/**
 * Props for {@link TextInputHookField}.
 *
 * @typeParam TErrorCode - Required validation error code keys mapped via `validationMessages`.
 * @typeParam TOptionalErrorCode - Optional validation error code keys mapped via `validationMessages`.
 * @public
 */
export interface TextInputHookFieldProps<
  TErrorCode extends string = never,
  TOptionalErrorCode extends string = never,
> extends BaseFieldProps {
  name: string
  formHookResult?: FormHookResult
  validationMessages?: ValidationMessages<TErrorCode, TOptionalErrorCode>
  transform?: (value: string) => string
  placeholder?: string
  FieldComponent?: ComponentType<TextInputProps>
}

/**
 * Text input field connected to a partner form hook result via `useHookFieldResolution`.
 *
 * @typeParam TErrorCode - Required validation error code keys mapped via `validationMessages`.
 * @typeParam TOptionalErrorCode - Optional validation error code keys mapped via `validationMessages`.
 * @param props - Field configuration including `name`, `formHookResult`, `transform`, `placeholder`, and label content.
 * @returns The rendered text input field wrapped in the field element registry.
 * @internal
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
