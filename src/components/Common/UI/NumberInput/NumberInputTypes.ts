import type { InputHTMLAttributes, Ref } from 'react'
import type { InputProps } from '../Input/InputTypes'
import type { SharedFieldLayoutProps } from '@/components/Common/FieldLayout/FieldLayoutTypes'

/**
 * Props your `NumberInput` implementation must accept from the component adapter.
 * Renders a form field wrapping a numeric `<input />` for currency, decimal, or percent values, with optional start/end adornments.
 *
 * @public
 * @group Component Props
 */
export interface NumberInputProps
  extends
    SharedFieldLayoutProps,
    Pick<
      InputHTMLAttributes<HTMLInputElement>,
      'min' | 'max' | 'name' | 'id' | 'placeholder' | 'className'
    > {
  /**
   * Format type for the number input
   */
  format?: 'currency' | 'decimal' | 'percent'
  /**
   * React ref for the number input element
   */
  inputRef?: Ref<HTMLInputElement>
  /**
   * Current value of the number input
   */
  value?: number
  /**
   * Indicates that the field has an error
   */
  isInvalid?: boolean
  /**
   * Disables the number input and prevents interaction
   */
  isDisabled?: boolean
  /**
   * Callback when number input value changes
   */
  onChange?: (value: number) => void
  /**
   * Handler for blur events
   */
  onBlur?: () => void
  /**
   * Fires on every keystroke with the raw input string (pre-commit), unlike onChange which fires on blur/Enter.
   */
  onInputChange?: (value: string) => void
  /**
   * Element to display at the start of the input
   */
  adornmentStart?: InputProps['adornmentStart']
  /**
   * Element to display at the end of the input
   */
  adornmentEnd?: InputProps['adornmentEnd']
  /**
   * Minimum number of decimal places to display
   */
  minimumFractionDigits?: number
  /**
   * Maximum number of decimal places to display
   */
  maximumFractionDigits?: number
}
