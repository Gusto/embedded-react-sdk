import type { InputHTMLAttributes, ReactNode, Ref } from 'react'

export interface InputProps
  extends Pick<
    InputHTMLAttributes<HTMLInputElement>,
    | 'className'
    | 'id'
    | 'name'
    | 'placeholder'
    | 'type'
    | 'value'
    | 'onChange'
    | 'onBlur'
    | 'aria-describedby'
    | 'aria-invalid'
    | 'min'
    | 'max'
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
   */
  isDisabled?: boolean
}

/**
 * Default prop values for Input component.
 * These are used by the component adapter to automatically provide defaults.
 */
export const InputDefaults = {
  isDisabled: false,
} as const satisfies Partial<InputProps>
