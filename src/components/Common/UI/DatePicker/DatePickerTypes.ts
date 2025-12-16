import type { InputHTMLAttributes, Ref } from 'react'
import type { SharedFieldLayoutProps } from '@/components/Common/FieldLayout/FieldLayoutTypes'

export interface DatePickerProps
  extends
    SharedFieldLayoutProps,
    Pick<InputHTMLAttributes<HTMLInputElement>, 'className' | 'id' | 'name'> {
  /**
   * React ref for the date input element
   */
  inputRef?: Ref<HTMLInputElement>
  /**
   * Disables the date picker and prevents interaction
   */
  isDisabled?: boolean
  /**
   * Indicates that the field has an error
   */
  isInvalid?: boolean
  /**
   * Callback when selected date changes
   */
  onChange?: (value: Date | null) => void
  /**
   * Handler for blur events
   */
  onBlur?: () => void
  /**
   * Label text for the date picker field
   */
  label: string
  /**
   * Currently selected date value
   */
  value?: Date | null
  /**
   * Placeholder text when no date is selected
   */
  placeholder?: string
  /**
   * Element to use as the portal container
   */
  portalContainer?: HTMLElement
  /**
   * Minimum selectable date. Dates before this will be disabled.
   */
  minValue?: Date
  /**
   * Maximum selectable date. Dates after this will be disabled.
   */
  maxValue?: Date
  /**
   * Function to determine if a specific date should be unavailable.
   * Useful for disabling weekends, holidays, or other specific dates.
   * @param date - The date to check
   * @returns true if the date should be disabled
   */
  isDateUnavailable?: (date: Date) => boolean
}
