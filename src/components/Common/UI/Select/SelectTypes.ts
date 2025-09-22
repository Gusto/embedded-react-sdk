import type { Ref, SelectHTMLAttributes } from 'react'
import type { SharedFieldLayoutProps } from '@/components/Common/FieldLayout/FieldLayoutTypes'

export interface SelectOption {
  /**
   * Value of the option that will be passed to onChange
   */
  value: string
  /**
   * Display text for the option
   */
  label: string
}

export interface SelectProps
  extends SharedFieldLayoutProps,
    Pick<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'name' | 'className'> {
  /**
   * Disables the select and prevents interaction
   */
  isDisabled?: boolean
  /**
   * Indicates that the field has an error
   */
  isInvalid?: boolean
  /**
   * Label text for the select field
   */
  label: string
  /**
   * Callback when selection changes
   */
  onChange?: (value: string) => void
  /**
   * Handler for blur events
   */
  onBlur?: () => void
  /**
   * Array of options to display in the select dropdown
   */
  options: SelectOption[]
  /**
   * Placeholder text when no option is selected
   */
  placeholder?: string
  /**
   * Currently selected value
   */
  value?: string
  /**
   * React ref for the select button element
   */
  inputRef?: Ref<HTMLButtonElement>
}
