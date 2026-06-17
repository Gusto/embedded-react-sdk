import type { Ref, InputHTMLAttributes } from 'react'
import type { InputProps } from '../Input/InputTypes'
import type { SharedFieldLayoutProps } from '@/components/Common/FieldLayout/FieldLayoutTypes'

/**
 * Props your `TextInput` implementation must accept from the component adapter.
 * Renders a form field wrapping an `<input />` with a label, description, error message, and start/end adornment slots.
 *
 * @public
 * @group Component Props
 */
export interface TextInputProps
  extends
    SharedFieldLayoutProps,
    Pick<
      InputHTMLAttributes<HTMLInputElement>,
      'name' | 'id' | 'placeholder' | 'className' | 'type' | 'min' | 'max' | 'maxLength'
    >,
    Pick<InputHTMLAttributes<HTMLInputElement>, 'aria-describedby' | 'aria-labelledby'> {
  /**
   * React ref for the input element
   */
  inputRef?: Ref<HTMLInputElement>
  /**
   * Current value of the input
   */
  value?: string
  /**
   * Callback when input value changes
   */
  onChange?: (value: string) => void
  /**
   * Indicates that the field has an error
   *
   * @defaultValue `false`
   */
  isInvalid?: boolean
  /**
   * Disables the input and prevents interaction
   *
   * @defaultValue `false`
   */
  isDisabled?: boolean
  /**
   * Handler for blur events
   */
  onBlur?: () => void
  /**
   * Element to display at the start of the input
   */
  adornmentStart?: InputProps['adornmentStart']
  /**
   * Element to display at the end of the input
   */
  adornmentEnd?: InputProps['adornmentEnd']
}

/**
 * Default prop values for the TextInput component.
 *
 * @internal
 */
export const TextInputDefaults = {
  type: 'text',
  isInvalid: false,
  isDisabled: false,
} as const satisfies Partial<TextInputProps>
