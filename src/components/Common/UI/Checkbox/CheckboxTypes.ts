import type { InputHTMLAttributes, Ref } from 'react'
import type { SharedHorizontalFieldLayoutProps } from '@/components/Common/HorizontalFieldLayout/HorizontalFieldLayoutTypes'

export interface CheckboxProps
  extends SharedHorizontalFieldLayoutProps,
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
   */
  isInvalid?: boolean
  /**
   * Disables the checkbox and prevents interaction
   */
  isDisabled?: boolean
  /**
   * Handler for blur events
   */
  onBlur?: () => void
}

/**
 * Default prop values for Checkbox component.
 */
export const CheckboxDefaults = {
  isInvalid: false,
  isDisabled: false,
} as const satisfies Partial<CheckboxProps>
