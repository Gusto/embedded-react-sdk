import type { InputHTMLAttributes, Ref } from 'react'
import type { SharedHorizontalFieldLayoutProps } from '@/components/Common/HorizontalFieldLayout/HorizontalFieldLayoutTypes'

/**
 * Props your `Checkbox` implementation must accept from the component adapter.
 * Renders a form field wrapping an `<input type="checkbox" />` with a label, optional description, and error message.
 *
 * @public
 * @group Component props
 */
export interface CheckboxProps
  extends
    SharedHorizontalFieldLayoutProps,
    Pick<InputHTMLAttributes<HTMLInputElement>, 'name' | 'id' | 'className'> {
  /**
   * Current checked state of the checkbox
   */
  value?: boolean
  /**
   * Callback when checkbox state changes
   */
  onChange?: (value: boolean) => void
  /**
   * React ref for the checkbox input element
   */
  inputRef?: Ref<HTMLInputElement>
  /**
   * Indicates if the checkbox is in an invalid state
   *
   * @defaultValue `false`
   */
  isInvalid?: boolean
  /**
   * Disables the checkbox and prevents interaction
   *
   * @defaultValue `false`
   */
  isDisabled?: boolean
  /**
   * Handler for blur events
   */
  onBlur?: () => void
}

/**
 * Default prop values for Checkbox component.
 *
 * @internal
 */
export const CheckboxDefaults = {
  isInvalid: false,
  isDisabled: false,
} as const satisfies Partial<CheckboxProps>
