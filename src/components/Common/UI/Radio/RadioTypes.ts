import type { InputHTMLAttributes, Ref } from 'react'
import type { SharedHorizontalFieldLayoutProps } from '@/components/Common/HorizontalFieldLayout/HorizontalFieldLayoutTypes'

/**
 * Props your `Radio` implementation must accept from the component adapter.
 * Renders a form field wrapping an `<input type="radio" />` with a label, optional description, and error message.
 *
 * @public
 */
export interface RadioProps
  extends
    SharedHorizontalFieldLayoutProps,
    Pick<InputHTMLAttributes<HTMLInputElement>, 'name' | 'id' | 'className' | 'onBlur'> {
  /**
   * Current checked state of the radio button
   */
  value?: boolean
  /**
   * Callback when radio button state changes
   */
  onChange?: (checked: boolean) => void
  /**
   * React ref for the radio input element
   */
  inputRef?: Ref<HTMLInputElement>
  /**
   * Indicates that the field has an error
   *
   * @defaultValue `false`
   */
  isInvalid?: boolean
  /**
   * Disables the radio button and prevents interaction
   *
   * @defaultValue `false`
   */
  isDisabled?: boolean
}

/**
 * Default prop values for the Radio component.
 *
 * @internal
 */
export const RadioDefaults = {
  isInvalid: false,
  isDisabled: false,
} as const satisfies Partial<RadioProps>
