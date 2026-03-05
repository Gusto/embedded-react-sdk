import type { InputHTMLAttributes, Ref } from 'react'
import type { SharedFieldLayoutProps } from '@/components/Common/FieldLayout/FieldLayoutTypes'

export interface MultiSelectComboBoxOption {
  /**
   * Display text for the option
   */
  label: string
  /**
   * Unique value identifier for the option
   */
  value: string
}

export interface MultiSelectComboBoxProps
  extends
    SharedFieldLayoutProps,
    Pick<InputHTMLAttributes<HTMLInputElement>, 'className' | 'id' | 'name' | 'placeholder'> {
  /**
   * React ref for the combo box input element
   */
  inputRef?: Ref<HTMLInputElement>
  /**
   * Disables the combo box and prevents interaction
   */
  isDisabled?: boolean
  /**
   * Indicates that the field has an error
   */
  isInvalid?: boolean
  /**
   * Indicates that options are being loaded
   */
  isLoading?: boolean
  /**
   * Label text for the multi-select combo box field
   */
  label: string
  /**
   * Array of options to display in the dropdown
   */
  options: MultiSelectComboBoxOption[]
  /**
   * Array of currently selected values
   */
  value?: string[]
  /**
   * Callback when the set of selected values changes
   */
  onChange?: (values: string[]) => void
  /**
   * Handler for blur events
   */
  onBlur?: () => void
}
