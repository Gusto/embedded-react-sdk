import type { InputHTMLAttributes, ReactNode, Ref } from 'react'

/**
 * Base text-input primitive used internally by `TextInput` and `NumberInput`.
 *
 * @remarks
 * Higher-level field components like TextInput and NumberInput reuse the
 * `adornmentStart` and `adornmentEnd` slots from this interface.
 *
 * @public
 * @group Component Props
 */
export interface InputProps extends Pick<
  InputHTMLAttributes<HTMLInputElement>,
  | 'className'
  | 'id'
  | 'name'
  | 'placeholder'
  | 'type'
  | 'value'
  | 'onChange'
  | 'onBlur'
  | 'onFocus'
  | 'aria-describedby'
  | 'aria-labelledby'
  | 'aria-invalid'
  | 'min'
  | 'max'
  | 'maxLength'
> {
  /**
   * Ref for the input element
   */
  inputRef?: Ref<HTMLInputElement>

  /**
   * Content to display at the start of the input
   */
  adornmentStart?: ReactNode

  /**
   * Content to display at the end of the input
   */
  adornmentEnd?: ReactNode

  /**
   * Whether the input is disabled
   * @defaultValue `false`
   */
  isDisabled?: boolean
}

/**
 * Default prop values for the Input primitive, applied through the component adapter.
 *
 * @internal
 */
export const InputDefaults = {
  isDisabled: false,
} as const satisfies Partial<InputProps>
