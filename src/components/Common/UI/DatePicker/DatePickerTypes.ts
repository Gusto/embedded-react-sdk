import type { InputHTMLAttributes, Ref, FocusEvent } from 'react'
import type { SharedFieldLayoutProps } from '@/components/Common/FieldLayout/FieldLayoutTypes'

export interface DatePickerProps
  extends SharedFieldLayoutProps,
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
  onBlur?: (e: FocusEvent) => void
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
}
