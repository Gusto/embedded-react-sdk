import type { InputHTMLAttributes, Ref } from 'react'
import type { SharedHorizontalFieldLayoutProps } from '@/components/Common/HorizontalFieldLayout/HorizontalFieldLayoutTypes'

export interface CheckboxProps
  extends
    SharedHorizontalFieldLayoutProps,
    Pick<InputHTMLAttributes<HTMLInputElement>, 'name' | 'id' | 'className'> {
  /**
   * Current checked state of the checkbox
   */
  value?: boolean
  /**
   * Renders the checkbox in an indeterminate state, used when some but not all items in a group are selected
   */
  isIndeterminate?: boolean
  /**
   * Callback when checkbox state changes.
   *
   * Receives the next boolean value (toggled from current).
   * Internally triggered via click rather than native change event
   * to avoid a controlled-input race condition with the `indeterminate` DOM property.
   * Custom adapter implementations should call this with the intended boolean value
   * rather than reading `event.target.checked`.
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
